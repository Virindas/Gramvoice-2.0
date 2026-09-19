import { Schema, model, Document } from 'mongoose';

export interface IVillager extends Document {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  language: 'English' | 'Hindi' | 'Tamil';
  pinHash: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VillagerSchema = new Schema<IVillager>({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  address: { type: String, default: '' },
  ward: { type: String, required: true },
  language: { type: String, enum: ['English', 'Hindi', 'Tamil'], default: 'English' },
  pinHash: { type: String, required: true },
  avatarUrl: { type: String }
}, {
  timestamps: true
});

export const Villager = model<IVillager>('Villager', VillagerSchema);
