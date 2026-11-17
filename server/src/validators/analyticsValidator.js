/**
 * @fileoverview Zod validation schemas for Analytics and Insights query parameters.
 */

import { z } from 'zod';

export const monthQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format')
    .optional(),
});

export const yearQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be a 4-digit number (e.g. 2026)')
    .optional(),
});
