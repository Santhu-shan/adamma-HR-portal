import { Schema, model, Document } from 'mongoose';

export interface IAppraisalRecord extends Document {
  userId: Schema.Types.ObjectId;
  cycleId: Schema.Types.ObjectId;
  status: 'DRAFT' | 'SELF_SUBMITTED' | 'TL_REVIEWED' | 'MANAGER_REVIEWED' | 'ADMIN_REVIEWED' | 'COMPLETED';
  ratings: {
    employee: { scores: number[]; feedback: string };
    tl: { scores: number[]; feedback: string };
    manager: { scores: number[]; feedback: string };
    admin: { scores: number[]; feedback: string };
  };
  sectionWeights: number[];
  finalAggregatedScore?: number;
  systemRecommendation?: 'PROMOTION' | 'HIKE_A' | 'HIKE_B' | 'PIP' | 'RETAIN';
  history: {
    fromStatus: string;
    toStatus: string;
    timestamp: Date;
    actor: Schema.Types.ObjectId;
    comments?: string;
  }[];
}

const AppraisalRecordSchema = new Schema<IAppraisalRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cycleId: { type: Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['DRAFT', 'SELF_SUBMITTED', 'TL_REVIEWED', 'MANAGER_REVIEWED', 'ADMIN_REVIEWED', 'COMPLETED'], default: 'DRAFT' },
  ratings: {
    employee: { scores: [{ type: Number }], feedback: { type: String } },
    tl: { scores: [{ type: Number }], feedback: { type: String } },
    manager: { scores: [{ type: Number }], feedback: { type: String } },
    admin: { scores: [{ type: Number }], feedback: { type: String } }
  },
  sectionWeights: { type: [{ type: Number }], required: true },
  finalAggregatedScore: { type: Number },
  systemRecommendation: { type: String, enum: ['PROMOTION', 'HIKE_A', 'HIKE_B', 'PIP', 'RETAIN'] },
  history: [{
    fromStatus: { type: String },
    toStatus: { type: String },
    timestamp: { type: Date, default: Date.now },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: { type: String }
  }]
}, { timestamps: true });

export const AppraisalRecordModel = model<IAppraisalRecord>('AppraisalRecord', AppraisalRecordSchema);
