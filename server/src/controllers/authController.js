/**
 * @fileoverview Thin request controller for Authentication and user profile endpoints.
 */

import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles POST /api/auth/sync.
 */
export const sync = asyncHandler(async (req, res) => {
  const result = await authService.syncUser(req.firebaseUser, req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Handles GET /api/users/me.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id || req.user._id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Handles PUT /api/users/me.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user.id || req.user._id, req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});
