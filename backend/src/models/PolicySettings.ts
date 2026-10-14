import { Schema, model, Document } from 'mongoose';

export interface IPolicySettings extends Document {
  version: number;
  shiftStartTime: string;
  shiftEndTime: string;
  lateAllowanceDays: number;
  lateMinutesCap: number;
  workingSaturdays: number[];
  ncnsThresholdConsecutiveDays: number;
  gracePeriodMinutes: number;
  breakWindows: { startTime: string; endTime: string }[];
}

const PolicySettingsSchema = new Schema<IPolicySettings>({
  version: { type: Number, default: 1 },
  shiftStartTime: { type: String, default: "09:30" },
  shiftEndTime: { type: String, default: "18:30" },
  lateAllowanceDays: { type: Number, default: 3 },
  lateMinutesCap: { type: Number, default: 50 },
  workingSaturdays: [{ type: Number }], // e.g. [1, 3, 5]
  ncnsThresholdConsecutiveDays: { type: Number, default: 2 },
  gracePeriodMinutes: { type: Number, default: 15 },
  breakWindows: [{
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }]
}, { timestamps: true });

export const PolicySettingsModel = model<IPolicySettings>('PolicySettings', PolicySettingsSchema);
