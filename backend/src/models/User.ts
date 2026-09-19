import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  passwordHash?: string;
  role: 'villager' | 'admin';
  address?: string;
  username?: string;
  designation?: string;
  department?: string;
  language: string;
  security_question?: string;
  security_answer_hash?: string;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['villager', 'admin'], required: true },
  address: { type: String },
  username: { type: String, unique: true, sparse: true },
  designation: { type: String },
  department: { type: String },
  language: { type: String, default: 'English' },
  security_question: { type: String },
  security_answer_hash: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const User = model<IUser>('User', UserSchema);
