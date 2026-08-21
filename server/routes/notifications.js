import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// Get notifications for current user
router.get('/', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_alex';
  const notifications = db.getNotifications(currentUserId);
  res.json({
    success: true,
    unreadCount: notifications.filter(n => !n.isRead).length,
    notifications
  });
});

// Mark single notification as read
router.put('/:id/read', (req, res) => {
  const notif = db.markNotificationRead(req.params.id);
  res.json({ success: true, notification: notif });
});

// Mark all as read
router.post('/read-all', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_alex';
  db.markAllNotificationsRead(currentUserId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
