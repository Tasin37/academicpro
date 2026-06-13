import { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  userId: Types.ObjectId;
  school?: string;
  degree?: string;
  major?: string;
  gradeLevel?: string;
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
  bio?: string;
  preferredWriters?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const StudentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    school: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      enum: ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Other'],
    },
    major: {
      type: String,
      trim: true,
    },
    gradeLevel: {
      type: String,
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    preferredWriters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Writer',
      },
    ],
  },
  { timestamps: true }
);
