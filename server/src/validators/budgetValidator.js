/**
 * @fileoverview Zod validation schemas for Budget creation, updates, and status queries.
 */

import { z } from 'zod';

export const createBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
  categoryId: z.string().trim().nullable().optional().default(null),
  limit: z.coerce.number().positive('Limit must be greater than zero'),
  alertThreshold: z.coerce.number().min(1).max(100).default(80),
});

export const updateBudgetSchema = z.object({
  limit: z.coerce.number().positive().optional(),
  alertThreshold: z.coerce.number().min(1).max(100).optional(),
});

export const budgetMonthQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format')
    .optional(),
});
