/**
 * @fileoverview Thin request controller for Budget endpoints.
 */

import * as budgetService from '../services/budgetService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles GET /api/budgets.
 */
export const list = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgets(req.user.id || req.user._id, req.query.month);
  res.status(200).json({
    success: true,
    data: budgets,
  });
});

/**
 * Handles POST /api/budgets.
 */
export const upsert = asyncHandler(async (req, res) => {
  const budget = await budgetService.upsertBudget(req.user.id || req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: budget,
  });
});

/**
 * Handles PUT /api/budgets/:id.
 */
export const update = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.user.id || req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: budget,
  });
});

/**
 * Handles DELETE /api/budgets/:id.
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await budgetService.deleteBudget(req.user.id || req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Handles GET /api/budgets/status.
 */
export const getStatus = asyncHandler(async (req, res) => {
  const status = await budgetService.getBudgetStatus(req.user.id || req.user._id, req.query.month);
  res.status(200).json({
    success: true,
    data: status,
  });
});
