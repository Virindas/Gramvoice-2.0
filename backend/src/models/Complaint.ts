import { Schema, model, Document, Types } from 'mongoose';

export interface IComplaint extends Document {
  id: string;
  citizenId: Types.ObjectId;
  type: 'voice' | 'text';
  category: string;
  department: string;
  transcript: string;
  complaint_text?: string;
  complaint_text_hi?: string;
  complaint_text_ta?: string;
  audioFileId?: Types.ObjectId;
  voice_recording_url?: string;
  voiceDuration?: number;
  status: 'Under Review' | 'In Progress' | 'Completed' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  adminReply?: string;
  adminReply_hi?: string;
  adminReply_ta?: string;
  assignedTeam?: string;
  reviewedByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
  id: { type: String, required: true, unique: true },
  citizenId: { type: Schema.Types.ObjectId, ref: 'Villager', required: true },
  type: { type: String, enum: ['voice', 'text'], required: true },
  category: { type: String, default: 'general' },
  department: { type: String, default: 'Panchayat' },
  transcript: { type: String, required: true },
  complaint_text: { type: String },
  complaint_text_hi: { type: String },
  complaint_text_ta: { type: String },
  audioFileId: { type: Schema.Types.ObjectId },
  voice_recording_url: { type: String },
  voiceDuration: { type: Number },
  status: {
    type: String,
    enum: ['Under Review', 'In Progress', 'Completed', 'Rejected'],
    default: 'Under Review'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  adminReply: { type: String },
  adminReply_hi: { type: String },
  adminReply_ta: { type: String },
  assignedTeam: { type: String },
  reviewedByAdminId: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

ComplaintSchema.index({ citizenId: 1, status: 1 });

export const Complaint = model<IComplaint>('Complaint', ComplaintSchema);
