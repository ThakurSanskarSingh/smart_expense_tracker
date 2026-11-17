/**
 * @fileoverview Zod validation schemas for Notification query and update operations.
 */

import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  unread: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});
