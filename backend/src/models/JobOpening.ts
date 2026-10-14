import { Schema, model, Document } from 'mongoose';

export interface IApplicant {
  _id?: Schema.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  stage: 'SCREENING' | 'INTERVIEW_L1' | 'INTERVIEW_L2' | 'OFFER_EXTENDED' | 'HIRED' | 'REJECTED';
  appliedAt: Date;
}

export interface IJobOpening extends Document {
  title: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  status: 'OPEN' | 'ON_HOLD' | 'CLOSED';
  openings: number;
  deadline: Date;
  jd: string;
  postedBy: Schema.Types.ObjectId;
  applicants: IApplicant[];
}

const JobOpeningSchema = new Schema<IJobOpening>({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'], default: 'FULL_TIME' },
  status: { type: String, enum: ['OPEN', 'ON_HOLD', 'CLOSED'], default: 'OPEN' },
  openings: { type: Number, default: 1 },
  deadline: { type: Date, required: true },
  jd: { type: String },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    experience: { type: String },
    stage: { type: String, enum: ['SCREENING', 'INTERVIEW_L1', 'INTERVIEW_L2', 'OFFER_EXTENDED', 'HIRED', 'REJECTED'], default: 'SCREENING' },
    appliedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export const JobOpeningModel = model<IJobOpening>('JobOpening', JobOpeningSchema);
