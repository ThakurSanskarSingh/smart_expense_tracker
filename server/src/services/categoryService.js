/**
 * @fileoverview Category management service.
 * Handles category creation, updates, and protected deletion with expense reassignment.
 */

import { Category } from '../models/Category.js';
import { Expense } from '../models/Expense.js';
import { Budget } from '../models/Budget.js';
import { AppError } from '../utils/AppError.js';

/**
 * Lists all categories for a given user.
 * @param {string} userId - User ObjectId.
 * @returns {Promise<Array<import('../models/Category.js').Category>>}
 */
export async function getCategories(userId) {
  return Category.find({ user: userId }).sort({ isDefault: -1, name: 1 });
}

/**
 * Creates a new custom category for a user.
 * @param {string} userId - User ObjectId.
 * @param {object} data - Category payload { name, color, icon }.
 * @returns {Promise<import('../models/Category.js').Category>}
 */
export async function createCategory(userId, data) {
  const existing = await Category.findOne({ user: userId, name: data.name.trim() });
  if (existing) {
    throw new AppError(`Category '${data.name}' already exists.`, 409, 'CATEGORY_ALREADY_EXISTS');
  }

  return Category.create({
    user: userId,
    name: data.name.trim(),
    color: data.color || '#3B82F6',
    icon: data.icon || 'tag',
    isDefault: false,
  });
}

/**
 * Updates an existing custom category.
 * @param {string} userId - User ObjectId.
 * @param {string} categoryId - Category ObjectId.
 * @param {object} updates - Update payload.
 * @returns {Promise<import('../models/Category.js').Category>}
 */
export async function updateCategory(userId, categoryId, updates) {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (updates.name && updates.name.trim() !== category.name) {
    const existing = await Category.findOne({ user: userId, name: updates.name.trim() });
    if (existing) {
      throw new AppError(`Category '${updates.name}' already exists.`, 409, 'CATEGORY_ALREADY_EXISTS');
    }
    category.name = updates.name.trim();
  }

  if (updates.color) category.color = updates.color;
  if (updates.icon) category.icon = updates.icon;

  await category.save();
  return category;
}

/**
 * Deletes a custom category. Default categories cannot be deleted.
 * Reassigns any expenses linked to this category to the user's default 'Other' category.
 * @param {string} userId - User ObjectId.
 * @param {string} categoryId - Category ObjectId.
 * @returns {Promise<{ message: string, reassignedCount: number }>}
 */
export async function deleteCategory(userId, categoryId) {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (category.isDefault) {
    throw new AppError('Default system categories cannot be deleted', 403, 'PROTECTED_CATEGORY');
  }

  // Find or ensure "Other" category exists for this user
  let otherCategory = await Category.findOne({ user: userId, name: 'Other' });
  if (!otherCategory) {
    otherCategory = await Category.create({
      user: userId,
      name: 'Other',
      color: '#64748B',
      icon: 'tag',
      isDefault: true,
    });
  }

  // Reassign all associated expenses to "Other"
  const reassignResult = await Expense.updateMany(
    { user: userId, category: categoryId },
    { $set: { category: otherCategory._id } },
  );

  // Remove any category-specific budget
  await Budget.deleteMany({ user: userId, category: categoryId });

  // Delete the category
  await Category.deleteOne({ _id: categoryId });

  return {
    message: 'Category deleted and expenses reassigned to Other',
    reassignedCount: reassignResult.modifiedCount,
  };
}
