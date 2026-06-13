import mongoose from 'mongoose';
import { UserSchema, type IUser } from './User';
import { StudentSchema, type IStudent } from './Student';
import { WriterSchema, type IWriter } from './Writer';
import { OrderSchema, type IOrder } from './Order';
import { PaymentSchema, type IPayment } from './Payment';
import { ReviewSchema, type IReview } from './Review';
import { MessageSchema, type IMessage } from './Message';
import { NotificationSchema, type INotification } from './Notification';

export const User = mongoose.model<IUser>('User', UserSchema);
export const Student = mongoose.model<IStudent>('Student', StudentSchema);
export const Writer = mongoose.model<IWriter>('Writer', WriterSchema);
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export const Review = mongoose.model<IReview>('Review', ReviewSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
