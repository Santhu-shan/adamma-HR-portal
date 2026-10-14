import { Schema, model, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  category: 'CORE' | 'COMPLIANCE' | 'SOFT_SKILLS' | 'TOOLS';
  description: string;
  duration: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  mandatory: boolean;
  hasCertificate: boolean;
  rating: number;
  createdBy: Schema.Types.ObjectId;
  isActive: boolean;
}

export interface IEnrollment extends Document {
  employee: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  progress: number;
  completedAt?: Date;
  certificateUrl?: string;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  category: { type: String, enum: ['CORE', 'COMPLIANCE', 'SOFT_SKILLS', 'TOOLS'], required: true },
  description: { type: String },
  duration: { type: String },
  level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
  mandatory: { type: Boolean, default: false },
  hasCertificate: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const EnrollmentSchema = new Schema<IEnrollment>({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  certificateUrl: { type: String },
}, { timestamps: true });

EnrollmentSchema.index({ employee: 1, course: 1 }, { unique: true });

export const CourseModel = model<ICourse>('Course', CourseSchema);
export const EnrollmentModel = model<IEnrollment>('Enrollment', EnrollmentSchema);
