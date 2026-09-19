import { Schema, model, Document, Types } from 'mongoose';

export interface IServiceRequest extends Document {
  citizenId: Types.ObjectId;
  serviceType: string;
  details?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  citizenId: { type: Schema.Types.ObjectId, ref: 'Villager', required: true },
  serviceType: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
}, {
  timestamps: true
});

export const ServiceRequest = model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
