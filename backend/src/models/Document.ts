import { Schema, model, Document as MDocument } from 'mongoose';

export interface IDocument extends MDocument {
  employee: Schema.Types.ObjectId;
  name: string;
  category: 'EMPLOYMENT' | 'KYC' | 'COMPENSATION' | 'POLICY' | 'MEDICAL' | 'VERIFICATION';
  url: string;
  size?: string;
  access: 'PRIVATE' | 'SHARED';
  owner: 'HR' | 'Employee';
  uploadedBy: Schema.Types.ObjectId;
}

const DocumentSchema = new Schema<IDocument>({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['EMPLOYMENT', 'KYC', 'COMPENSATION', 'POLICY', 'MEDICAL', 'VERIFICATION'], required: true },
  url: { type: String, required: true },
  size: { type: String },
  access: { type: String, enum: ['PRIVATE', 'SHARED'], default: 'PRIVATE' },
  owner: { type: String, enum: ['HR', 'Employee'], default: 'Employee' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const DocumentModel = model<IDocument>('Document', DocumentSchema);
