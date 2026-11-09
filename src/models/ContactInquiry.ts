import { Schema, Document } from "mongoose";

export interface IContactInquiry extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ContactInquirySchema.index({ isRead: 1, createdAt: -1 });
