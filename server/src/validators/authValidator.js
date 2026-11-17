/**
 * @fileoverview Zod validation schemas for User authentication and profile operations.
 */

import { z } from 'zod';

export const syncUserSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  currency: z.string().trim().min(2).max(5).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).optional(),
  currency: z.string().trim().min(2).max(5).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});
