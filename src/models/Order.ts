import { Schema, Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  REVISION = 'revision',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IOrder extends Document {
  studentId: Types.ObjectId;
  writerId?: Types.ObjectId;
  studentName?: string;
  studentEmail?: string;
  whatsappNumber?: string;
  subjectCode?: string;
  title: string;
  description: string;
  subject: string;
  deadline: Date;
  pages?: number;
  academicLevel: string;
  budget: number;
  status: OrderStatus;
  attachments?: string[];
  cloudLink?: string;
  notes?: string;
  submittedDocument?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = new Schema<IOrder>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    writerId: {
      type: Schema.Types.ObjectId,
      ref: 'Writer',
    },
    studentName: {
      type: String,
      trim: true,
    },
    studentEmail: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    pages: {
      type: Number,
      min: 1,
    },
    academicLevel: {
      type: String,
      enum: ['High School', 'Associate', 'Bachelor', 'Master', 'PhD'],
      default: 'Bachelor',
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    attachments: [String],
    cloudLink: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    submittedDocument: String,
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);
