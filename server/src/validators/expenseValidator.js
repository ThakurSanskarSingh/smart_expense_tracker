/**
 * @fileoverview Zod validation schemas for Expense operations, filtering, and pagination.
 */

import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  categoryId: z.string().trim().min(1, 'Category ID is required'),
  description: z.string().trim().min(1, 'Description is required').max(200),
  date: z.coerce.date().default(() => new Date()),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'netbanking', 'other']).default('upi'),
  notes: z.string().trim().max(1000).optional().default(''),
  recurring: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
      nextDue: z.coerce.date().nullable().optional(),
    })
    .optional()
    .default({ enabled: false, frequency: 'monthly', nextDue: null }),
});

export const updateExpenseSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  categoryId: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).max(200).optional(),
  date: z.coerce.date().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'netbanking', 'other']).optional(),
  notes: z.string().trim().max(1000).optional(),
  recurring: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
      nextDue: z.coerce.date().nullable().optional(),
    })
    .optional(),
});

export const listExpensesQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'netbanking', 'other']).optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  sort: z.string().default('-date'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
