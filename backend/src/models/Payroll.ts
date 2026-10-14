import { Schema, model, Document } from 'mongoose';

export interface IPayroll extends Document {
  employee: Schema.Types.ObjectId;
  month: string;
  year: number;
  basic: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  gross: number;
  pf: number;
  esi: number;
  tds: number;
  professionalTax: number;
  totalDeductions: number;
  net: number;
  status: 'PENDING' | 'PAID';
  paidOn?: Date;
  generatedBy: Schema.Types.ObjectId;
}

const PayrollSchema = new Schema<IPayroll>({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basic: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  conveyance: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  gross: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  esi: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  net: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
  paidOn: { type: Date },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
export const PayrollModel = model<IPayroll>('Payroll', PayrollSchema);
