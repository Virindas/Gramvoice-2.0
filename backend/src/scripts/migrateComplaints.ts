import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Complaint } from '../models/Complaint';

dotenv.config();

export async function runComplaintMigration() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gramvoice';
  console.log('[Migration] Connecting to MongoDB for Complaint Schema Migration...');

  let closeDbOnFinish = false;
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
    closeDbOnFinish = true;
  }

  try {
    const complaints = await Complaint.find({});
    console.log(`[Migration] Found ${complaints.length} complaint document(s) to inspect/migrate.`);

    let updatedCount = 0;
    for (const c of complaints) {
      let modified = false;

      // 1. complaint_text field migration
      if (!c.complaint_text) {
        c.complaint_text = c.transcript || '';
        modified = true;
      }

      // 2. voice_recording_url field migration
      if (!c.voice_recording_url && (c.audioFileId || c.type === 'voice')) {
        c.voice_recording_url = `/api/complaints/${c.id}/audio`;
        modified = true;
      }

      if (modified) {
        await c.save();
        updatedCount++;
      }
    }

    console.log(`[Migration] Complaint schema migration completed successfully. Updated ${updatedCount} document(s).`);
  } catch (err) {
    console.error('[Migration] Error during complaint migration:', err);
  } finally {
    if (closeDbOnFinish) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  runComplaintMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
