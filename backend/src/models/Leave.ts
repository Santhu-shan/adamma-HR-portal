import { Schema, model, Document } from 'mongoose';

export interface ILeave extends Document {
  userId: Schema.Types.ObjectId;
  type: 'EL' | 'CL' | 'SL' | 'COMP_OFF' | 'LOP' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT';
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'PENDING' | 'TL_APPROVED' | 'APPROVED' | 'REJECTED' | 'RETURNED_TO_USER';
  appliedAt: Date;
  approvedBy: { role: string; userId: Schema.Types.ObjectId; date: Date }[];
  documents: string[]; // urls for medical proof / SL requirements
  remarks?: string;
  compOffEarnedFrom?: Date;
}

const LeaveSchema = new Schema<ILeave>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['EL', 'CL', 'SL', 'COMP_OFF', 'LOP', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'TL_APPROVED', 'APPROVED', 'REJECTED', 'RETURNED_TO_USER'], default: 'PENDING' },
  appliedAt: { type: Date, default: Date.now },
  approvedBy: [{
    role: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now }
  }],
  documents: [{ type: String }],
  remarks: { type: String },
  compOffEarnedFrom: { type: Date }
}, { timestamps: true });

export const LeaveModel = model<ILeave>('Leave', LeaveSchema);
