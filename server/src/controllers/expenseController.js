/**
 * @fileoverview Thin request controller for Expense endpoints.
 */

import * as expenseService from '../services/expenseService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles GET /api/expenses.
 */
export const list = asyncHandler(async (req, res) => {
  const result = await expenseService.getExpenses(req.user.id || req.user._id, req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Handles POST /api/expenses.
 */
export const create = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user.id || req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: expense,
  });
});

/**
 * Handles GET /api/expenses/:id.
 */
export const getById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.user.id || req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    data: expense,
  });
});

/**
 * Handles PUT /api/expenses/:id.
 */
export const update = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user.id || req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: expense,
  });
});

/**
 * Handles DELETE /api/expenses/:id.
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(req.user.id || req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Handles GET /api/expenses/export.csv.
 */
export const exportCSV = asyncHandler(async (req, res) => {
  await expenseService.streamExpensesCSV(req.user.id || req.user._id, req.query, res);
});
