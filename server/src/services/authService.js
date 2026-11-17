/**
 * @fileoverview Authentication and user profile synchronization service.
 */

import { User } from '../models/User.js';
import { Category, DEFAULT_CATEGORIES } from '../models/Category.js';
import { AppError } from '../utils/AppError.js';

/**
 * Synchronizes a Firebase authenticated user with MongoDB.
 * Seeds default categories on initial profile creation.
 * @param {object} firebaseUser - Decoded Firebase JWT payload.
 * @param {object} [profileOverrides] - Optional client user overrides (currency, theme, name).
 * @returns {Promise<{ user: import('../models/User.js').User, isNewUser: boolean }>}
 */
export async function syncUser(firebaseUser, profileOverrides = {}) {
  const { uid, email, name: fbName } = firebaseUser;
  if (!uid || !email) {
    throw new AppError('Firebase payload missing uid or email', 400, 'INVALID_FIREBASE_PAYLOAD');
  }

  let user = await User.findOne({ uid });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await User.create({
      uid,
      email,
      name: profileOverrides.name || fbName || email.split('@')[0],
      currency: profileOverrides.currency || 'INR',
      theme: profileOverrides.theme || 'dark',
    });

    // Seed default categories for new user
    const categoryDocs = DEFAULT_CATEGORIES.map((cat) => ({
      user: user._id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      isDefault: true,
    }));
    await Category.insertMany(categoryDocs);
  } else if (Object.keys(profileOverrides).length > 0) {
    if (profileOverrides.name) user.name = profileOverrides.name;
    if (profileOverrides.currency) user.currency = profileOverrides.currency;
    if (profileOverrides.theme) user.theme = profileOverrides.theme;
    await user.save();
  }

  return { user, isNewUser };
}

/**
 * Retrieves the current authenticated user's profile.
 * @param {string} userId - User ObjectId string.
 * @returns {Promise<import('../models/User.js').User>}
 */
export async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
  }
  return user;
}

/**
 * Updates the current authenticated user's profile.
 * @param {string} userId - User ObjectId string.
 * @param {object} updates - Fields to update.
 * @returns {Promise<import('../models/User.js').User>}
 */
export async function updateUserProfile(userId, updates) {
  const allowed = ['name', 'currency', 'theme'];
  const updateData = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
}
