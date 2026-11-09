import { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
