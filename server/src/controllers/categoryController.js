/**
 * @fileoverview Thin request controller for Category endpoints.
 */

import * as categoryService from '../services/categoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles GET /api/categories.
 */
export const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.user.id || req.user._id);
  res.status(200).json({
    success: true,
    data: categories,
  });
});

/**
 * Handles POST /api/categories.
 */
export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user.id || req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: category,
  });
});

/**
 * Handles PUT /api/categories/:id.
 */
export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.user.id || req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * Handles DELETE /api/categories/:id.
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.user.id || req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});
