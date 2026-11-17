/**
 * @fileoverview Thin request controller for Financial Insights endpoints.
 */

import * as insightService from '../services/insightService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles GET /api/insights.
 */
export const getInsights = asyncHandler(async (req, res) => {
  const result = await insightService.getInsights(req.user.id || req.user._id, req.query.month);
  res.status(200).json({
    success: true,
    data: result,
  });
});
