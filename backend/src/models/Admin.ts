import { Schema, model, Document } from 'mongoose';

export interface ISecurityQuestion {
  question: string;
  answerHash: string;
}

export interface IAdmin extends Document {
  fullName: string;
  officeOrDepartment: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  governmentKeyUsed?: string;
  securityQuestions: ISecurityQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  fullName: { type: String, required: true },
  officeOrDepartment: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  phoneNumber: { type: String, required: true },
  passwordHash: { type: String, required: true },
  governmentKeyUsed: { type: String },
  securityQuestions: [{
    question: { type: String, required: true },
    answerHash: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export const Admin = model<IAdmin>('Admin', AdminSchema);
