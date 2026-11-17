/**
 * @fileoverview Notification routing declarations.
 */

import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listNotificationsQuerySchema } from '../validators/notificationValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listNotificationsQuerySchema, 'query'), notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
