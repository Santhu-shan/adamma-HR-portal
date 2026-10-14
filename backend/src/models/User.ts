import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  employeeId?: string;
  profilePic?: string;
  name: string;
  email: string;
  password?: string; // Hashed credential field
  mobile: string;
  role: 'ADMIN' | 'MANAGER' | 'TL' | 'EMPLOYEE';
  managerId?: Schema.Types.ObjectId;
  tlId?: Schema.Types.ObjectId;
  dateOfJoining: Date;
  dob?: string;
  designation?: string;
  department?: string;
  location?: string;
  status: 'PROBATION' | 'CONFIRMED' | 'TERMINATED' | 'SUSPENDED';
  probationEnd: Date;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    uan?: string;
    pfMemberId?: string;
    pan?: string;
  };
  salary: {
    baseSalary: number;
    hra?: number;
    conveyance?: number;
    medical?: number;
    otherAllowance?: number;
    lta?: number;
    annualMedical?: number;
    bonus?: number;
  };
  deductions: {
    epf?: number;
    tds?: number;
    profTax?: number;
    retentionAmount?: number;
  };
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  isConfirmed: boolean;
  twoFactorSecret?: string;
  is2FAEnabled: boolean;
  permissions: { type: [String], default: [] },
  documents: { type: string; url: string; uploadedAt: Date }[];
  clBalance: number;
  elBalance: number;
  slBalance: number;
  compOffBalance: number;
  otp?: string;
  otpExpires?: Date;
  deactivatedAt?: Date;
  scheduledDeletionDate?: Date;
  deletionNotificationSent?: boolean;
}

const UserSchema = new Schema<IUser>({
  employeeId: { type: String, unique: true, sparse: true, index: true },
  profilePic: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String }, // Hashed password
  mobile: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'TL', 'EMPLOYEE'], required: true, index: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  tlId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  dateOfJoining: { type: Date, required: true },
  dob: { type: String },
  designation: { type: String },
  department: { type: String },
  location: { type: String, default: 'Bengaluru' },
  status: { type: String, enum: ['PROBATION', 'CONFIRMED', 'TERMINATED', 'SUSPENDED'], required: true },
  probationEnd: { type: Date, required: true },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    uan: { type: String },
    pfMemberId: { type: String },
    pan: { type: String }
  },
  salary: {
    baseSalary: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
    lta: { type: Number, default: 0 },
    annualMedical: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 }
  },
  deductions: {
    epf: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    profTax: { type: Number, default: 0 },
    retentionAmount: { type: Number, default: 0 }
  },
  emergencyContact: {
    name: { type: String, default: '--' },
    relation: { type: String, default: '--' },
    phone: { type: String, default: '--' }
  },
  isConfirmed: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  is2FAEnabled: { type: Boolean, default: false },
  permissions: { type: [String], default: [] },
  documents: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  clBalance: { type: Number, default: 12 },
  elBalance: { type: Number, default: 0 },
  slBalance: { type: Number, default: 6 },
  compOffBalance: { type: Number, default: 0 },
  otp: { type: String },
  otpExpires: { type: Date },
  deactivatedAt: { type: Date },
  scheduledDeletionDate: { type: Date },
  deletionNotificationSent: { type: Boolean, default: false }
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);
