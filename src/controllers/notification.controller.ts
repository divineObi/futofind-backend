import { Response } from 'express';
import Notification from '../models/notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all notifications for the logged-in user, sorted newest first
export const getNotifications = async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user!._id }).sort({ createdAt: -1 });
  res.json(notifications);
};

// Mark all unread notifications as read for the logged-in user
export const markNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
  res.status(200).json({ message: 'Notifications marked as read' });
};