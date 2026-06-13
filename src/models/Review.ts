import { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  orderId: Types.ObjectId;
  studentId: Types.ObjectId;
  writerId: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  qualityScore: number;
  communicationScore: number;
  timelinessScore: number;
  isAnonymous: boolean;
  isPinned: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    writerId: {
      type: Schema.Types.ObjectId,
      ref: 'Writer',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    qualityScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    communicationScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    timelinessScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
