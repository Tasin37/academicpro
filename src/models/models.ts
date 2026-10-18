import mongoose from 'mongoose';
import { UserSchema, type IUser } from './User';
import { StudentSchema, type IStudent } from './Student';
import { WriterSchema, type IWriter } from './Writer';
import { OrderSchema, type IOrder } from './Order';
import { PaymentSchema, type IPayment } from './Payment';
import { ReviewSchema, type IReview } from './Review';
import { MessageSchema, type IMessage } from './Message';
import { NotificationSchema, type INotification } from './Notification';

export const User: mongoose.Model<IUser> =
  (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export const Student: mongoose.Model<IStudent> =
  (mongoose.models.Student as mongoose.Model<IStudent>) || mongoose.model<IStudent>('Student', StudentSchema);

export const Writer: mongoose.Model<IWriter> =
  (mongoose.models.Writer as mongoose.Model<IWriter>) || mongoose.model<IWriter>('Writer', WriterSchema);

export const Order: mongoose.Model<IOrder> =
  (mongoose.models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);

export const Payment: mongoose.Model<IPayment> =
  (mongoose.models.Payment as mongoose.Model<IPayment>) || mongoose.model<IPayment>('Payment', PaymentSchema);

export const Review: mongoose.Model<IReview> =
  (mongoose.models.Review as mongoose.Model<IReview>) || mongoose.model<IReview>('Review', ReviewSchema);

export const Message: mongoose.Model<IMessage> =
  (mongoose.models.Message as mongoose.Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema);

export const Notification: mongoose.Model<INotification> =
  (mongoose.models.Notification as mongoose.Model<INotification>) || mongoose.model<INotification>('Notification', NotificationSchema);
