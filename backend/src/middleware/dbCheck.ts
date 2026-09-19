import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export function dbCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is currently unavailable or reconnecting. Please try again in a moment.'
    });
  }
  next();
}
