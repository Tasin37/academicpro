import { Schema, Document, Types } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role: string;
  institution?: string;
  quote: string;
  rating: number;
  avatar?: string;
  userId?: Types.ObjectId;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: 'Student',
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    quote: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    avatar: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
