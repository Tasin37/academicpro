import { Schema, Document, Types } from 'mongoose';

export enum NotificationType {
  ORDER_PLACED = 'order_placed',
  ORDER_ASSIGNED = 'order_assigned',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_REFUNDED = 'payment_refunded',
  REVIEW_POSTED = 'review_posted',
  MESSAGE_RECEIVED = 'message_received',
  DEADLINE_APPROACHING = 'deadline_approaching',
  WRITER_VERIFIED = 'writer_verified',
  SYSTEM_UPDATE = 'system_update',
}

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    actionUrl: String,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
