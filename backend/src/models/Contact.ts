import { Schema, model, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  role: string;
  phoneNumber: string;
  office?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  office: { type: String }
}, {
  timestamps: true
});

export const Contact = model<IContact>('Contact', ContactSchema);
