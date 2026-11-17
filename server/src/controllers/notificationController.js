/**
 * @fileoverview Thin request controller for Notification endpoints.
 */

import * as notificationService from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles GET /api/notifications.
 */
export const list = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const notifications = await notificationService.getNotifications(req.user.id || req.user._id, unreadOnly);
  res.status(200).json({
    success: true,
    data: notifications,
  });
});

/**
 * Handles PATCH /api/notifications/:id/read.
 */
export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(req.user.id || req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    data: notification,
  });
});

/**
 * Handles PATCH /api/notifications/read-all.
 */
export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsAsRead(req.user.id || req.user._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});
