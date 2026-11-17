/**
 * @fileoverview Thin request controller for Analytics aggregation endpoints.
 */

import * as analyticsService from '../services/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles GET /api/analytics/summary.
 */
export const getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(req.user.id || req.user._id, req.query.month);
  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * Handles GET /api/analytics/by-category.
 */
export const getByCategory = asyncHandler(async (req, res) => {
  const breakdown = await analyticsService.getByCategory(req.user.id || req.user._id, req.query.month);
  res.status(200).json({
    success: true,
    data: breakdown,
  });
});

/**
 * Handles GET /api/analytics/monthly.
 */
export const getMonthly = asyncHandler(async (req, res) => {
  const monthly = await analyticsService.getMonthly(req.user.id || req.user._id, req.query.year);
  res.status(200).json({
    success: true,
    data: monthly,
  });
});

/**
 * Handles GET /api/analytics/yearly.
 */
export const getYearly = asyncHandler(async (req, res) => {
  const yearly = await analyticsService.getYearly(req.user.id || req.user._id);
  res.status(200).json({
    success: true,
    data: yearly,
  });
});

/**
 * Handles GET /api/analytics/budget-vs-actual.
 */
export const getBudgetVsActual = asyncHandler(async (req, res) => {
  const comparison = await analyticsService.getBudgetVsActual(req.user.id || req.user._id, req.query.month);
  res.status(200).json({
    success: true,
    data: comparison,
  });
});
