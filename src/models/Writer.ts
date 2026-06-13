import { Schema, Document, Types } from 'mongoose';

export interface IWriter extends Document {
  userId: Types.ObjectId;
  expertise: string[];
  bio: string;
  hourlyRate: number;
  isVerified: boolean;
  totalOrders: number;
  totalEarnings: number;
  averageRating: number;
  successRate: number;
  responseTime: number;
  education?: string;
  experience?: string;
  certifications?: string[];
  portfolio?: string;
  bankAccountLinked: boolean;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const WriterSchema = new Schema<IWriter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      maxlength: 1000,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    responseTime: {
      type: Number,
      default: 24,
      min: 1,
    },
    education: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    certifications: [String],
    portfolio: {
      type: String,
    },
    bankAccountLinked: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
