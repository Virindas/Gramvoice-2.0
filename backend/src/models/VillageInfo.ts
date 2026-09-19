import { Schema, model, Document, Types } from 'mongoose';

export interface IVillageInfo extends Document {
  title: string;
  category: string;
  content: string;
  penalty: string;
  effectiveDate?: string;
  createdByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VillageInfoSchema = new Schema<IVillageInfo>({
  title: { type: String, required: true },
  category: { type: String, default: 'policy' },
  content: { type: String, required: true },
  penalty: { type: String, default: 'None' },
  effectiveDate: { type: String },
  createdByAdminId: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

export const VillageInfo = model<IVillageInfo>('VillageInfo', VillageInfoSchema);
