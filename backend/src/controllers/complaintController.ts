import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Complaint } from '../models/Complaint';
import { Villager } from '../models/Villager';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadAudioToGridFS, getAudioStreamFromGridFS, getGridFSBucket } from '../config/gridfs';
import { transcribeAudio } from '../utils/whisper';
import { translateText } from '../utils/translator';
import { ObjectId } from 'mongodb';

function classifyComplaint(transcript: string, requestedCategory?: string, requestedDept?: string) {
  const text = (transcript || '').toLowerCase();

  let category = requestedCategory && requestedCategory !== 'general' ? requestedCategory : 'general';
  let department = requestedDept && requestedDept !== 'Panchayat' ? requestedDept : 'Panchayat';
  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';

  if (/water|shortage|pipeline|pipe|leak|tank|borewell|drinking/i.test(text)) {
    category = 'Water';
    department = 'Water Supply Department';
    priority = 'High';
  } else if (/electricity|power|light|current|eb|transformer|voltage|wire|pole/i.test(text)) {
    category = 'Electricity';
    department = 'Electricity Board (EB)';
    priority = 'High';
  } else if (/garbage|waste|drainage|sewer|clean|smell|dustbin|mosquito/i.test(text)) {
    category = 'Sanitation';
    department = 'Public Health & Sanitation';
    priority = 'Medium';
  } else if (/road|pothole|bridge|street light|path|construction/i.test(text)) {
    category = 'Infrastructure';
    department = 'Public Works Dept (PWD)';
    priority = 'Medium';
  } else if (/hospital|clinic|doctor|crop|fertilizer|farmer|health/i.test(text)) {
    category = 'Health & Agriculture';
    department = 'Health & Agriculture Dept';
    priority = 'Medium';
  }

  if (/danger|emergency|fire|accident|severe|urgent|hazard|blast/i.test(text)) {
    priority = 'Critical';
  }

  return { category, department, priority };
}

export const complaintController = {
  transcribeVoice: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Audio file is required for transcription' });
      }

      const tempDir = path.join(__dirname, '../../scratch');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const ext = req.file.mimetype.split('/')[1] || 'webm';
      const tempPath = path.join(tempDir, `voice-${Date.now()}.${ext}`);
      fs.writeFileSync(tempPath, req.file.buffer);

      let transcript = '';
      let language = 'auto';
      try {
        const whisperRes = await transcribeAudio(tempPath);
        transcript = whisperRes.transcript;
        language = whisperRes.language;
      } finally {
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch (e) {}
        }
      }

      const classified = classifyComplaint(transcript);

      return res.status(200).json({
        success: true,
        transcript,
        language,
        category: classified.category,
        department: classified.department,
        priority: classified.priority
      });
    } catch (error: any) {
      console.error('Transcription endpoint error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Transcription failed' });
    }
  },

  createComplaint: async (req: AuthRequest, res: Response) => {
    try {
      const {
        textDescription,
        category: reqCategory,
        department: reqDept,
        inputMethod = 'Manual',
        type = inputMethod?.toLowerCase() === 'voice' ? 'voice' : 'text',
        voiceDuration
      } = req.body;

      let transcriptText = req.body.complaint_text || textDescription || 'Voice recording submitted';
      const classified = classifyComplaint(transcriptText, reqCategory, reqDept);

      const userId = req.user?.id;
      let citizenId: any;

      if (userId && ObjectId.isValid(userId)) {
        citizenId = new ObjectId(userId);
      } else {
        // Fallback or guest citizen resolution
        let defaultCitizen = await Villager.findOne({});
        if (!defaultCitizen) {
          defaultCitizen = new Villager({
            fullName: req.user?.name || 'Citizen Resident',
            phoneNumber: req.user?.phone || '9876543210',
            address: 'Gram Panchayat',
            ward: 'Ward 1',
            language: 'English',
            pinHash: 'default'
          });
          await defaultCitizen.save();
        }
        citizenId = defaultCitizen._id;
      }

      let audioFileId: ObjectId | undefined;
      if (req.file) {
        if (req.file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: 'Audio file exceeds maximum size limit of 10MB' });
        }
        audioFileId = await uploadAudioToGridFS(
          req.file.buffer,
          `voice-${Date.now()}.${req.file.mimetype.split('/')[1] || 'webm'}`,
          req.file.mimetype || 'audio/webm'
        );
      }

      if (!transcriptText) {
        transcriptText = 'Voice recording submitted';
      }

      // Generate unique human-readable Ticket ID e.g. TKT-837291
      let ticketCode = '';
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const existing = await Complaint.findOne({ id: ticketCode });
        if (!existing) isUnique = true;
        attempts++;
      }

      const voiceUrl = req.file || audioFileId ? `/api/complaints/${ticketCode}/audio` : req.body.voice_recording_url;

      const complaint = new Complaint({
        id: ticketCode,
        citizenId,
        type: type || (req.file ? 'voice' : 'text'),
        category: classified.category,
        department: classified.department,
        transcript: transcriptText,
        complaint_text: transcriptText,
        audioFileId,
        voice_recording_url: voiceUrl,
        voiceDuration: voiceDuration ? Number(voiceDuration) : undefined,
        status: 'Under Review',
        priority: classified.priority
      });

      await complaint.save();
      const populated = await Complaint.findById(complaint._id).populate('citizenId');

      return res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        complaint: populated
      });
    } catch (error: any) {
      console.error('Create complaint error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getMyComplaints: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized session' });
      }

      const searchId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
      const list = await Complaint.find({
        $or: [{ citizenId: searchId }, { citizenId: userId }]
      })
        .populate('citizenId')
        .sort({ createdAt: -1 });

      console.log(`[getMyComplaints] User ID: ${userId} -> Found ${list.length} complaint(s)`);
      return res.status(200).json({ success: true, complaints: list });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getAllComplaints: async (req: AuthRequest, res: Response) => {
    try {
      const list = await Complaint.find({})
        .populate('citizenId')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, complaints: list });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getComplaintDetails: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      let ticket = await Complaint.findOne({ id }).populate('citizenId');
      if (!ticket && ObjectId.isValid(id)) {
        ticket = await Complaint.findById(id).populate('citizenId');
      }
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }
      return res.status(200).json({ success: true, complaint: ticket });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  translateComplaint: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { targetLang } = req.body; // 'hi' | 'ta' | 'en'

    if (!targetLang || !['hi', 'ta', 'en'].includes(targetLang)) {
      return res.status(400).json({ success: false, message: 'Valid targetLang (hi, ta, en) is required' });
    }

    try {
      let ticket = await Complaint.findOne({ id });
      if (!ticket && ObjectId.isValid(id)) {
        ticket = await Complaint.findById(id);
      }
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      const sourceText = ticket.complaint_text || ticket.transcript || '';
      const sourceReply = ticket.adminReply || '';

      if (targetLang === 'en') {
        return res.status(200).json({
          success: true,
          translatedText: sourceText,
          translatedReply: sourceReply,
          cached: true
        });
      }

      // Check cached translations
      let translated = targetLang === 'hi' ? ticket.complaint_text_hi : ticket.complaint_text_ta;
      let translatedReply = targetLang === 'hi' ? ticket.adminReply_hi : ticket.adminReply_ta;

      let neededSave = false;

      if (!translated && sourceText) {
        translated = await translateText(sourceText, targetLang as 'hi' | 'ta');
        if (targetLang === 'hi') ticket.complaint_text_hi = translated;
        else ticket.complaint_text_ta = translated;
        neededSave = true;
      }

      if (!translatedReply && sourceReply) {
        translatedReply = await translateText(sourceReply, targetLang as 'hi' | 'ta');
        if (targetLang === 'hi') ticket.adminReply_hi = translatedReply;
        else ticket.adminReply_ta = translatedReply;
        neededSave = true;
      }

      if (neededSave) {
        await ticket.save();
      }

      return res.status(200).json({
        success: true,
        translatedText: translated || sourceText,
        translatedReply: translatedReply || sourceReply,
        cached: !neededSave
      });
    } catch (error: any) {
      console.error('Translation error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateComplaint: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, priority, adminNotes, adminReply, assignedTeam } = req.body;

    try {
      let ticket = await Complaint.findOne({ id });
      if (!ticket && ObjectId.isValid(id)) {
        ticket = await Complaint.findById(id);
      }
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      if (status !== undefined) ticket.status = status;
      if (priority !== undefined) ticket.priority = priority;
      if (adminNotes !== undefined || adminReply !== undefined) ticket.adminReply = adminNotes || adminReply;
      if (assignedTeam !== undefined) ticket.assignedTeam = assignedTeam;
      if (req.user?.id && ObjectId.isValid(req.user.id)) {
        ticket.reviewedByAdminId = new ObjectId(req.user.id);
      }

      await ticket.save();
      const updated = await Complaint.findById(ticket._id).populate('citizenId');

      return res.status(200).json({
        success: true,
        message: 'Complaint updated successfully',
        complaint: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteComplaint: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      let ticket = await Complaint.findOneAndDelete({ id });
      if (!ticket && ObjectId.isValid(id)) {
        ticket = await Complaint.findByIdAndDelete(id);
      }
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }
      return res.status(200).json({ success: true, message: 'Complaint deleted' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  streamAudio: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      let ticket = await Complaint.findOne({ id });
      if (!ticket && ObjectId.isValid(id)) {
        ticket = await Complaint.findById(id);
      }

      if (!ticket || !ticket.audioFileId) {
        return res.status(404).json({ success: false, message: 'Audio recording not found for this complaint' });
      }

      const bucket = getGridFSBucket();
      const fileId = new ObjectId(ticket.audioFileId);

      const files = await bucket.find({ _id: fileId }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ success: false, message: 'Audio file missing from GridFS storage' });
      }

      const fileInfo = files[0];
      res.set('Content-Type', fileInfo.contentType || 'audio/webm');
      res.set('Content-Length', String(fileInfo.length));
      res.set('Accept-Ranges', 'bytes');

      const downloadStream = bucket.openDownloadStream(fileId);
      downloadStream.pipe(res);
    } catch (error: any) {
      console.error('Audio stream error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
