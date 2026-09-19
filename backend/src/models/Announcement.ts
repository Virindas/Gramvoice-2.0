import { Schema, model, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  createdByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdByAdminId: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

AnnouncementSchema.pre('save', function (next) {
  if (!this.description && this.content) {
    this.description = this.content;
  }
  if (!this.content && this.description) {
    this.content = this.description;
  }
  next();
});

export const Announcement = model<IAnnouncement>('Announcement', AnnouncementSchema);
