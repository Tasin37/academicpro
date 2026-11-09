import { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  authorName: string;
  authorId?: Types.ObjectId;
  coverImage?: string;
  readTime: string;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Academic Writing',
      trim: true,
    },
    authorName: {
      type: String,
      default: 'AcademicPro Editorial',
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    coverImage: {
      type: String,
      trim: true,
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
