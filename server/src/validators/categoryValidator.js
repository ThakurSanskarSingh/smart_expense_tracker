/**
 * @fileoverview Zod validation schemas for Category management.
 */

import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex code (e.g. #3B82F6)'),
  icon: z.string().trim().min(1).max(30).default('tag'),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex code')
    .optional(),
  icon: z.string().trim().min(1).max(30).optional(),
});
