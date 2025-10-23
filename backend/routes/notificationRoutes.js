import { Router } from 'express';
import { getUserNotifications, markNotificationAsRead, deleteNotification } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET / - get all notifications for the authenticated user
router.get('/', authenticateToken, getUserNotifications);

// PUT /:notificationId/read - mark a notification as read
router.put('/:notificationId/read', authenticateToken, markNotificationAsRead);

// DELETE /:notificationId - delete a notification
router.delete('/:notificationId', authenticateToken, deleteNotification);

export default router;





