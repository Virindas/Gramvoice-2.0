import mongoose from 'mongoose';
import dns from 'dns';

// Disable infinite query buffering when disconnected to prevent 10s hanging errors
mongoose.set('bufferTimeoutMS', 3000);

export async function connectDatabase(): Promise<void> {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    /* fallback to default OS DNS */
  }

  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gramvoice';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/gramvoice';

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected. Reconnecting in 3s...');
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) {
        attemptConnection(primaryUri, localFallbackUri).catch((err) =>
          console.error('[MongoDB] Reconnect error:', err.message)
        );
      }
    }, 3000);
  });

  await attemptConnection(primaryUri, localFallbackUri);
}

import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';

async function seedDefaultAdmin(): Promise<void> {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] No administrators found. Seeding default admin account...');
      const admin = new Admin({
        fullName: 'Panchayat Administrator',
        email: 'admin@panchayat.gov.in',
        phoneNumber: '9999999999',
        passwordHash: await bcrypt.hash('admin123', 10),
        officeOrDepartment: 'Panchayat Office',
        governmentKeyUsed: 'GV2026',
        securityQuestions: [
          { question: 'What is your birthplace?', answerHash: await bcrypt.hash('rampur', 10) },
          { question: 'What was the name of your first school?', answerHash: await bcrypt.hash('government school', 10) }
        ]
      });
      await admin.save();
      console.log('[MongoDB] Default admin created: admin@panchayat.gov.in / admin123');
    }
  } catch (err: any) {
    console.warn('[MongoDB] Admin seeding notice:', err.message);
  }
}

async function attemptConnection(primaryUri: string, fallbackUri: string): Promise<void> {
  // Try primary URI (Atlas) first
  try {
    console.log('[MongoDB] Attempting connection to primary database...');
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false,
    });
    console.log('[MongoDB] Successfully connected to primary MongoDB.');
    await seedDefaultAdmin();
    return;
  } catch (primaryError: any) {
    console.warn('[MongoDB] Primary connection failed:', primaryError.message);
  }

  // If primary fails and primary isn't local, try local MongoDB fallback
  if (primaryUri !== fallbackUri) {
    try {
      console.log('[MongoDB] Attempting connection to local MongoDB fallback...');
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        bufferCommands: false,
      });
      console.log('[MongoDB] Successfully connected to local MongoDB fallback.');
      await seedDefaultAdmin();
      return;
    } catch (fallbackError: any) {
      console.warn('[MongoDB] Local fallback connection failed:', fallbackError.message);
    }
  }

  console.error('[MongoDB] Database unavailable. Backend will serve requests with clear error status.');
}

