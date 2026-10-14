import { Schema, model, Document } from 'mongoose';

export interface ITicketComment {
  by: string;
  userId?: Schema.Types.ObjectId;
  text: string;
  time: Date;
}

export interface ITicket extends Document {
  employee: Schema.Types.ObjectId;
  subject: string;
  category: 'IT_ACCESS' | 'PAYROLL' | 'LEAVE' | 'ATTENDANCE' | 'GENERAL' | 'POLICY' | 'ASSETS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  comments: ITicketComment[];
}

const TicketSchema = new Schema<ITicket>({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ['IT_ACCESS', 'PAYROLL', 'LEAVE', 'ATTENDANCE', 'GENERAL', 'POLICY', 'ASSETS'], required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  assignedTo: { type: String, default: 'Support Team' },
  comments: [{
    by: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export const TicketModel = model<ITicket>('Ticket', TicketSchema);
