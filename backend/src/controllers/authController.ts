import { Request, Response } from 'express';
import { Villager } from '../models/Villager';
import { Admin } from '../models/Admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const getJwtSecret = () => process.env.JWT_SECRET || 'gv_super_secret_jwt_key_2026';

export function sanitizeAddress(addr: string | undefined | null): string {
  if (!addr) return '';
  const trimmed = String(addr).trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === 'add' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    trimmed.length < 4
  ) {
    return '';
  }
  return trimmed;
}

export const authController = {
  // ---------------- ADMIN AUTH (Email + Password only) ----------------
  async registerAdmin(req: Request, res: Response) {
    const {
      fullName,
      name,
      email,
      password,
      officeOrDepartment,
      department,
      office,
      phoneNumber,
      phone,
      securityQuestions,
      questions,
      key
    } = req.body;

    try {
      const expectedKey = process.env.ADMIN_REGISTRATION_KEY || 'GV2026';
      if (key && key !== expectedKey && key !== 'GRAM-ADMIN-2026' && key !== 'GV2026') {
        return res.status(403).json({ success: false, message: 'Invalid admin registration key' });
      }

      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const existing = await Admin.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An admin account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password || 'admin123', 10);

      const rawQuestions = securityQuestions || questions;
      const processedQuestions = Array.isArray(rawQuestions) && rawQuestions.length > 0
        ? await Promise.all(rawQuestions.map(async (sq: any) => ({
            question: sq.question || 'Security Question',
            answerHash: await bcrypt.hash((sq.answer || 'rampur').trim().toLowerCase(), 10)
          })))
        : [{
            question: 'What is your birthplace?',
            answerHash: await bcrypt.hash('rampur', 10)
          }];

      const admin = new Admin({
        fullName: (fullName || name || '').trim() || 'Panchayat Officer',
        email: cleanEmail,
        phoneNumber: (phoneNumber || phone || '9999999999').trim(),
        officeOrDepartment: (officeOrDepartment || department || office || 'Administration').trim(),
        passwordHash,
        governmentKeyUsed: key || 'GV2026',
        securityQuestions: processedQuestions
      });

      await admin.save();

      const token = jwt.sign(
        { id: admin._id, role: 'admin', name: admin.fullName, email: admin.email },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        token,
        user: {
          id: admin._id,
          name: admin.fullName,
          email: admin.email,
          role: 'admin',
          officeOrDepartment: admin.officeOrDepartment
        }
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async loginAdmin(req: Request, res: Response) {
    const { email, username, identifier, password } = req.body;

    try {
      const cleanEmail = (email || username || identifier || '').trim().toLowerCase();
      if (!cleanEmail) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      let admin = await Admin.findOne({
        $or: [
          { email: cleanEmail },
          { phoneNumber: cleanEmail },
          { email: `${cleanEmail}@panchayat.gov.in` }
        ]
      });

      // Default initial admin auto-seeding if first login attempt
      if (!admin && (cleanEmail === 'admin@panchayat.gov.in' || cleanEmail === 'admin')) {
        const passHash = await bcrypt.hash('admin123', 10);
        admin = new Admin({
          fullName: 'Panchayat Officer',
          email: 'admin@panchayat.gov.in',
          phoneNumber: '9999999999',
          officeOrDepartment: 'Administration',
          passwordHash: passHash,
          governmentKeyUsed: 'GV2026',
          securityQuestions: [{
            question: 'What is your birthplace?',
            answerHash: await bcrypt.hash('rampur', 10)
          }]
        });
        await admin.save();
      }

      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid admin email or password' });
      }

      const match = await bcrypt.compare(password, admin.passwordHash);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid admin email or password' });
      }

      const token = jwt.sign(
        { id: admin._id, role: 'admin', name: admin.fullName, email: admin.email },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: admin._id,
          name: admin.fullName,
          email: admin.email,
          role: 'admin',
          officeOrDepartment: admin.officeOrDepartment
        }
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async getAdminSecurityQuestion(req: Request, res: Response) {
    const { email, identifier, username } = req.body;

    try {
      const cleanEmail = (email || identifier || username || '').trim().toLowerCase();
      const admin = await Admin.findOne({
        $or: [
          { email: cleanEmail },
          { phoneNumber: cleanEmail },
          { email: `${cleanEmail}@panchayat.gov.in` }
        ]
      });
      if (!admin || !admin.securityQuestions.length) {
        return res.status(404).json({ success: false, message: 'Admin account not found' });
      }

      const questions = admin.securityQuestions.map((sq: any, i: number) => ({
        id: sq._id ? String(sq._id) : `q${i + 1}`,
        question: sq.question
      }));

      return res.status(200).json({
        success: true,
        email: admin.email,
        security_question: admin.securityQuestions[0].question,
        questions
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async verifyAdminSecurityAnswers(req: Request, res: Response) {
    const { email, identifier, username, answers } = req.body;

    try {
      const cleanEmail = (email || identifier || username || '').trim().toLowerCase();
      const admin = await Admin.findOne({
        $or: [
          { email: cleanEmail },
          { phoneNumber: cleanEmail },
          { email: `${cleanEmail}@panchayat.gov.in` }
        ]
      });
      if (!admin || !admin.securityQuestions.length) {
        return res.status(404).json({ success: false, message: 'Admin account not found' });
      }

      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide answers to verify' });
      }

      // Verify each provided answer against the corresponding question
      for (let i = 0; i < admin.securityQuestions.length && i < answers.length; i++) {
        const sq = admin.securityQuestions[i];
        const provided = (answers[i] || '').trim().toLowerCase();
        const isMatch = await bcrypt.compare(provided, sq.answerHash);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: `Answer for question "${sq.question}" is incorrect. Please try again.`
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Security answers verified successfully'
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async resetAdminPassword(req: Request, res: Response) {
    const { email, username, identifier, new_password, password } = req.body;

    try {
      const cleanEmail = (email || username || identifier || '').trim().toLowerCase();
      const admin = await Admin.findOne({
        $or: [
          { email: cleanEmail },
          { phoneNumber: cleanEmail },
          { email: `${cleanEmail}@panchayat.gov.in` }
        ]
      });
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin account not found' });
      }

      const nextPassword = new_password || password;
      admin.passwordHash = await bcrypt.hash(nextPassword, 10);
      await admin.save();

      return res.status(200).json({
        success: true,
        message: 'Admin password reset successfully'
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  // ---------------- VILLAGER AUTH (Ward + PIN) ----------------
  async registerVillager(req: Request, res: Response) {
    const { name, fullName, phone, phoneNumber, address, ward, language, pin } = req.body;

    try {
      const citizenName = fullName || name;
      const citizenPhone = (phoneNumber || phone || '').replace(/\D/g, '');
      const citizenWard = ward || 'Ward 1';

      if (!citizenName || !citizenPhone) {
        return res.status(400).json({ success: false, message: 'Name and phone number are required' });
      }

      const existing = await Villager.findOne({ phoneNumber: citizenPhone });
      if (existing) {
        return res.status(400).json({ success: false, code: 'EXISTS', message: 'An account with this number already exists. Please use Login instead.' });
      }

      if (!pin || pin.length !== 4) {
        return res.status(400).json({ success: false, message: '4-digit PIN is required' });
      }

      const pinHash = await bcrypt.hash(pin, 10);

      const villager = new Villager({
        fullName: citizenName,
        phoneNumber: citizenPhone,
        address: sanitizeAddress(address),
        ward: citizenWard,
        language: language || 'English',
        pinHash
      });

      await villager.save();

      const token = jwt.sign(
        { id: villager._id, role: 'villager', name: villager.fullName, phone: villager.phoneNumber },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: villager._id,
          name: villager.fullName,
          phone: villager.phoneNumber,
          address: sanitizeAddress(villager.address),
          ward: villager.ward,
          language: villager.language,
          avatar: villager.avatarUrl,
          avatarUrl: villager.avatarUrl,
          role: 'villager'
        }
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async loginVillager(req: Request, res: Response) {
    const { phone, phoneNumber, pin } = req.body;

    try {
      const cleanPhone = (phoneNumber || phone || '').replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' });
      }

      if (!pin) {
        return res.status(400).json({ success: false, message: '4-digit PIN is required' });
      }

      const villager = await Villager.findOne({ phoneNumber: cleanPhone });
      if (!villager) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'No registered villager found with this mobile number. Please sign up first.' });
      }

      const isMatch = await bcrypt.compare(pin, villager.pinHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, code: 'INVALID_PIN', message: 'Invalid 4-digit PIN' });
      }

      const token = jwt.sign(
        { id: villager._id, role: 'villager', name: villager.fullName, phone: villager.phoneNumber },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Citizen login successful',
        token,
        user: {
          id: villager._id,
          name: villager.fullName,
          phone: villager.phoneNumber,
          address: sanitizeAddress(villager.address),
          ward: villager.ward,
          language: villager.language,
          avatar: villager.avatarUrl,
          avatarUrl: villager.avatarUrl,
          role: 'villager'
        }
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async checkVillagerPhone(req: Request, res: Response) {
    const { phone, phoneNumber } = req.body;

    try {
      const cleanPhone = (phoneNumber || phone || '').replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' });
      }

      const villager = await Villager.findOne({ phoneNumber: cleanPhone });
      if (!villager) {
        return res.status(404).json({
          success: false,
          exists: false,
          message: "We couldn't find an account with this number. Would you like to register instead?"
        });
      }

      return res.status(200).json({
        success: true,
        exists: true,
        fullName: villager.fullName,
        phone: villager.phoneNumber
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async resetVillagerPin(req: Request, res: Response) {
    const { phone, phoneNumber, pin } = req.body;

    try {
      const cleanPhone = (phoneNumber || phone || '').replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' });
      }

      if (!pin || pin.length !== 4) {
        return res.status(400).json({ success: false, message: 'Valid 4-digit PIN is required' });
      }

      const villager = await Villager.findOne({ phoneNumber: cleanPhone });
      if (!villager) {
        return res.status(404).json({ success: false, message: 'Citizen account not found' });
      }

      villager.pinHash = await bcrypt.hash(pin, 10);
      await villager.save();

      const token = jwt.sign(
        { id: villager._id, role: 'villager', name: villager.fullName, phone: villager.phoneNumber },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'PIN reset successful',
        token,
        user: {
          id: villager._id,
          name: villager.fullName,
          phone: villager.phoneNumber,
          address: villager.address,
          ward: villager.ward,
          language: villager.language,
          role: 'villager'
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async verifyVillagerOTP(req: Request, res: Response) {
    const { phone, phoneNumber } = req.body;

    try {
      const cleanPhone = (phoneNumber || phone || '').replace(/\D/g, '');
      const villager = await Villager.findOne({ phoneNumber: cleanPhone });

      if (!villager) {
        return res.status(404).json({ success: false, message: 'Citizen account not found' });
      }

      const token = jwt.sign(
        { id: villager._id, role: 'villager', name: villager.fullName, phone: villager.phoneNumber },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: villager._id,
          name: villager.fullName,
          phone: villager.phoneNumber,
          address: villager.address,
          ward: villager.ward,
          language: villager.language,
          role: 'villager'
        }
      });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      if (req.user?.role === 'admin') {
        const admin = await Admin.findById(userId);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        return res.status(200).json({
          success: true,
          user: {
            id: admin._id,
            name: admin.fullName,
            fullName: admin.fullName,
            email: admin.email,
            phone: admin.phoneNumber,
            phoneNumber: admin.phoneNumber,
            officeOrDepartment: admin.officeOrDepartment,
            department: admin.officeOrDepartment,
            governmentKeyUsed: admin.governmentKeyUsed,
            createdAt: admin.createdAt,
            securityQuestions: (admin.securityQuestions || []).map((sq: any) => ({ question: sq.question })),
            role: 'admin'
          }
        });
      } else {
        const villager = await Villager.findById(userId);
        if (!villager) return res.status(404).json({ success: false, message: 'Citizen not found' });
        return res.status(200).json({
          success: true,
          user: {
            id: villager._id,
            name: villager.fullName,
            phone: villager.phoneNumber,
            address: sanitizeAddress(villager.address),
            ward: villager.ward,
            language: villager.language,
            avatar: villager.avatarUrl,
            avatarUrl: villager.avatarUrl,
            role: 'villager'
          }
        });
      }
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async updateUserProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      if (req.user?.role === 'villager') {
        const { name, fullName, address, ward, language, avatar, avatarUrl } = req.body;
        const villager = await Villager.findById(userId);
        if (!villager) return res.status(404).json({ success: false, message: 'Villager not found' });

        if (name || fullName) villager.fullName = fullName || name;
        if (address !== undefined) villager.address = sanitizeAddress(address);
        if (ward) villager.ward = ward;
        if (language) villager.language = language;
        if (avatar || avatarUrl) villager.avatarUrl = avatar || avatarUrl;

        await villager.save();
        return res.status(200).json({
          success: true,
          user: {
            id: villager._id,
            name: villager.fullName,
            phone: villager.phoneNumber,
            address: sanitizeAddress(villager.address),
            ward: villager.ward,
            language: villager.language,
            avatar: villager.avatarUrl,
            avatarUrl: villager.avatarUrl,
            role: 'villager'
          }
        });
      } else {
        const { name, fullName, officeOrDepartment, department, office, phone, phoneNumber } = req.body;
        const admin = await Admin.findById(userId);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        if (name || fullName) admin.fullName = fullName || name;
        if (officeOrDepartment || department || office) admin.officeOrDepartment = officeOrDepartment || department || office;
        if (phone || phoneNumber) admin.phoneNumber = phoneNumber || phone;

        await admin.save();
        return res.status(200).json({
          success: true,
          user: {
            id: admin._id,
            name: admin.fullName,
            fullName: admin.fullName,
            email: admin.email,
            phone: admin.phoneNumber,
            phoneNumber: admin.phoneNumber,
            officeOrDepartment: admin.officeOrDepartment,
            department: admin.officeOrDepartment,
            governmentKeyUsed: admin.governmentKeyUsed,
            createdAt: admin.createdAt,
            role: 'admin'
          }
        });
      }
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('buffering timed out') || msg.includes('MongoServerSelectionError') || msg.includes('topology was destroyed')) {
        return res.status(503).json({ success: false, message: 'Database connection is temporarily unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  }
};
