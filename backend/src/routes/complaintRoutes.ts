import { Router } from 'express';
import multer from 'multer';
import { complaintController } from '../controllers/complaintController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// Stream audio from GridFS
router.get('/:id/audio', complaintController.streamAudio as any);

// Citizens: transcribe audio, lodge a ticket (supports text or multipart voice upload), retrieve their own list
router.post('/transcribe', upload.single('audio'), complaintController.transcribeVoice as any);
router.post('/', authMiddleware as any, upload.single('audio'), complaintController.createComplaint as any);
router.get('/my', authMiddleware as any, complaintController.getMyComplaints as any);

// Admins & Citizens: view all, fetch details, modify status/priority/assignedTeam
router.get('/', authMiddleware as any, adminOnly as any, complaintController.getAllComplaints as any);
router.get('/:id', authMiddleware as any, complaintController.getComplaintDetails as any);
router.post('/:id/translate', authMiddleware as any, complaintController.translateComplaint as any);
router.patch('/:id', authMiddleware as any, complaintController.updateComplaint as any);
router.delete('/:id', authMiddleware as any, adminOnly as any, complaintController.deleteComplaint as any);

export default router;
