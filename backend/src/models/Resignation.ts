import { Schema, model, Document } from 'mongoose';

export interface IResignation extends Document {
  employee: Schema.Types.ObjectId;
  lastWorkingDay: Date;
  separationType: 'VOLUNTARY' | 'BETTER_OPPORTUNITY' | 'HIGHER_EDUCATION' | 'PERSONAL_REASON' | 'HEALTH';
  reason: string;
  status: 'SUBMITTED' | 'TL_ACKNOWLEDGED' | 'MANAGER_APPROVED' | 'KT_COMPLETE' | 'ASSETS_RECOVERED' | 'FF_SETTLED' | 'RELIEVED' | 'WITHDRAWN';
  ktChecklist: { item: string; done: boolean }[];
  tlAcknowledgedAt?: Date;
  managerApprovedAt?: Date;
  relievedAt?: Date;
  noticePeriodDays: number;
  withdrawnAt?: Date;
}

const ResignationSchema = new Schema<IResignation>({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lastWorkingDay: { type: Date, required: true },
  separationType: { type: String, enum: ['VOLUNTARY', 'BETTER_OPPORTUNITY', 'HIGHER_EDUCATION', 'PERSONAL_REASON', 'HEALTH'], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['SUBMITTED', 'TL_ACKNOWLEDGED', 'MANAGER_APPROVED', 'KT_COMPLETE', 'ASSETS_RECOVERED', 'FF_SETTLED', 'RELIEVED', 'WITHDRAWN'], default: 'SUBMITTED' },
  ktChecklist: [{ item: { type: String }, done: { type: Boolean, default: false } }],
  tlAcknowledgedAt: { type: Date },
  managerApprovedAt: { type: Date },
  relievedAt: { type: Date },
  noticePeriodDays: { type: Number, default: 30 },
  withdrawnAt: { type: Date },
}, { timestamps: true });

export const ResignationModel = model<IResignation>('Resignation', ResignationSchema);
