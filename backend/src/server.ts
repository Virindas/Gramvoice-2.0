import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  /* fallback to default */
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database';
import { dbCheckMiddleware } from './middleware/dbCheck';

// Import Routes
import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import announcementRoutes from './routes/announcementRoutes';
import serviceRequestRoutes from './routes/serviceRequestRoutes';
import villageInfoRoutes from './routes/villageInfoRoutes';
import contactRoutes from './routes/contactRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Database connection asynchronously
connectDatabase().catch(err => {
  console.error('Database connection failed on startup:', err.message);
});

// Health check endpoint (verifies MongoDB status)
app.get('/api/health', (req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: 'GramVoice backend is running',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Apply DB connection middleware to API routes requiring database
app.use('/api/auth', dbCheckMiddleware as any, authRoutes);
app.use('/api/complaints', dbCheckMiddleware as any, complaintRoutes);
app.use('/api/announcements', dbCheckMiddleware as any, announcementRoutes);
app.use('/api/service-requests', dbCheckMiddleware as any, serviceRequestRoutes);
app.use('/api/village-info', dbCheckMiddleware as any, villageInfoRoutes);
app.use('/api/contacts', dbCheckMiddleware as any, contactRoutes);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error Handler]:', err);

  const message = (err.message || '').toLowerCase();
  if (message.includes('buffering timed out') || message.includes('connect ECONNREFUSED') || message.includes('MongoServerSelectionError')) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is temporarily unavailable. Please try again shortly.'
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
