import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'villager' | 'admin';
    name?: string;
    phone?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'gv_super_secret_jwt_key_2026';

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      phone: decoded.phone
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

import { Admin } from '../models/Admin';

export async function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Double check Admin database in case token was created under dual role or missing role flag
  if (req.user) {
    try {
      let adminDoc = null;
      if (req.user.id) {
        adminDoc = await Admin.findById(req.user.id);
      }
      if (!adminDoc && req.user.phone) {
        adminDoc = await Admin.findOne({ phoneNumber: req.user.phone });
      }

      if (adminDoc) {
        req.user.role = 'admin';
        return next();
      }
    } catch {
      // ignore db error and fall through
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrators only. Please sign in with an Administrator account.'
  });
}

