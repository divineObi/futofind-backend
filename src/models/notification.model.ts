import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, required: true },
  link: { type: String }, // Optional link to navigate to on click
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;