import { Schema, model, Document } from 'mongoose';

export interface IAttendance extends Document {
  userId: Schema.Types.ObjectId;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  workingHours: number; // in decimal hours
  isLate: boolean;
  lateMinutes: number;
  breakSlots: { outTime: Date; inTime?: Date; durationMinutes?: number }[];
  isLocked: boolean; // locked for breaks
  autoMarked: boolean; // marked NCNS or ABSENT automatically
  status: 'PRESENT' | 'ABSENT' | 'NCNS' | 'WEEK_OFF' | 'HOLIDAY';
  source: 'WEB' | 'BIOMETRIC' | 'SYSTEM';
  notes?: string;
}

const AttendanceSchema = new Schema<IAttendance>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  clockIn: { type: Date },
  clockOut: { type: Date },
  workingHours: { type: Number, default: 0 },
  isLate: { type: Boolean, default: false },
  lateMinutes: { type: Number, default: 0 },
  breakSlots: [{
    outTime: { type: Date, required: true },
    inTime: { type: Date },
    durationMinutes: { type: Number }
  }],
  isLocked: { type: Boolean, default: false },
  autoMarked: { type: Boolean, default: false },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'NCNS', 'WEEK_OFF', 'HOLIDAY'], required: true },
  source: { type: String, enum: ['WEB', 'BIOMETRIC', 'SYSTEM'], default: 'WEB' },
  notes: { type: String }
}, { timestamps: true });

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
export const AttendanceModel = model<IAttendance>('Attendance', AttendanceSchema);
