/**
 * @fileoverview Notification retrieval and status management service.
 */

import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';

/**
 * Lists user notifications with optional unread filter.
 * @param {string} userId - User ObjectId.
 * @param {boolean} [unreadOnly=false] - Whether to return only unread notifications.
 */
export async function getNotifications(userId, unreadOnly = false) {
  const query = { user: userId };
  if (unreadOnly) {
    query.read = false;
  }
  return Notification.find(query).sort({ createdAt: -1 }).limit(50);
}

/**
 * Marks a single notification as read.
 * @param {string} userId - User ObjectId.
 * @param {string} notificationId - Notification ObjectId.
 */
export async function markNotificationAsRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true },
  );

  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return notification;
}

/**
 * Marks all notifications for a user as read.
 * @param {string} userId - User ObjectId.
 */
export async function markAllNotificationsAsRead(userId) {
  const result = await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  return { modifiedCount: result.modifiedCount };
}
