import { Schema, model, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  createdBy: Schema.Types.ObjectId;
  readBy: Schema.Types.ObjectId[];
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const AnnouncementModel = model<IAnnouncement>('Announcement', AnnouncementSchema);
