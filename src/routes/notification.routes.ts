import { Router, json } from 'express';
import { getNotifications, markNotificationsAsRead } from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Get all notifications for the user
router.get('/', protect, getNotifications);

// Mark all notifications as read (using PATCH as it's an update operation)
router.patch('/read', protect, markNotificationsAsRead);

export default router;