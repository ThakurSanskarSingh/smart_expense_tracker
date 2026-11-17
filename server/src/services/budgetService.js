/**
 * @fileoverview Budget calculation and proactive threshold alert evaluation service.
 */

import { Budget } from '../models/Budget.js';
import { Expense } from '../models/Expense.js';
import { Category } from '../models/Category.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';

/**
 * Returns formatted month string 'YYYY-MM' from Date object or string.
 * @param {Date|string} date
 * @returns {string}
 */
export function getMonthString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Evaluates budget alerts for a specific month and user.
 * Triggered after expense create, update, or delete.
 * Creates budget_warning (>= alertThreshold) and budget_exceeded (>= 100%).
 * Ensures only one notification per budget, month, and level.
 * @param {string} userId - User ObjectId.
 * @param {Date|string} expenseDate - Date of the modified expense.
 */
export async function evaluateBudgetAlerts(userId, expenseDate) {
  const month = getMonthString(expenseDate);
  const budgets = await Budget.find({ user: userId, month }).populate('category');

  if (!budgets || budgets.length === 0) return;

  const [yearStr, monthStr] = month.split('-');
  const startOfMonth = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1));
  const endOfMonth = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10), 0, 23, 59, 59, 999));

  for (const budget of budgets) {
    const matchQuery = {
      user: budget.user,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    if (budget.category) {
      matchQuery.category = budget.category._id || budget.category;
    }

    const aggregateResult = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent = aggregateResult.length > 0 ? aggregateResult[0].total : 0;
    const percent = Math.round((spent / budget.limit) * 100 * 10) / 10;
    const catName = budget.category ? budget.category.name : 'Overall';

    // 100% Exceeded Alert
    if (percent >= 100) {
      const existingExceeded = await Notification.findOne({
        user: userId,
        type: 'budget_exceeded',
        'meta.budgetId': budget._id.toString(),
        'meta.month': month,
      });

      if (!existingExceeded) {
        await Notification.create({
          user: userId,
          type: 'budget_exceeded',
          message: `${catName} budget exceeded! Spent ₹${spent.toLocaleString()} of ₹${budget.limit.toLocaleString()} (${percent}%).`,
          meta: { budgetId: budget._id.toString(), month, limit: budget.limit, spent, percent },
        });
      }
    } else if (percent >= budget.alertThreshold) {
      // Threshold Warning Alert
      const existingWarning = await Notification.findOne({
        user: userId,
        type: 'budget_warning',
        'meta.budgetId': budget._id.toString(),
        'meta.month': month,
      });

      if (!existingWarning) {
        await Notification.create({
          user: userId,
          type: 'budget_warning',
          message: `Warning: ${catName} budget reached ${percent}% of limit (₹${spent.toLocaleString()} / ₹${budget.limit.toLocaleString()}).`,
          meta: { budgetId: budget._id.toString(), month, limit: budget.limit, spent, percent },
        });
      }
    }
  }
}

/**
 * Lists all budgets for a given user, optionally filtered by month.
 * @param {string} userId - User ObjectId.
 * @param {string} [month] - Month string 'YYYY-MM'.
 */
export async function getBudgets(userId, month) {
  const query = { user: userId };
  if (month) query.month = month;
  return Budget.find(query).populate('category').sort({ month: -1, limit: -1 });
}

/**
 * Creates or updates a budget limit for a category (or overall if categoryId is null).
 * @param {string} userId - User ObjectId.
 * @param {object} payload - { month, categoryId, limit, alertThreshold }.
 */
export async function upsertBudget(userId, payload) {
  const { month, categoryId, limit, alertThreshold = 80 } = payload;

  let categoryRef = null;
  if (categoryId) {
    const category = await Category.findOne({ _id: categoryId, user: userId });
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    categoryRef = category._id;
  }

  const budget = await Budget.findOneAndUpdate(
    { user: userId, category: categoryRef, month },
    { $set: { limit, alertThreshold } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate('category');

  // Trigger evaluation for new/updated budget
  await evaluateBudgetAlerts(userId, `${month}-01`);

  return budget;
}

/**
 * Updates a budget by ID.
 * @param {string} userId - User ObjectId.
 * @param {string} budgetId - Budget ObjectId.
 * @param {object} updates - Updates { limit, alertThreshold }.
 */
export async function updateBudget(userId, budgetId, updates) {
  const budget = await Budget.findOne({ _id: budgetId, user: userId });
  if (!budget) {
    throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
  }

  if (updates.limit !== undefined) budget.limit = updates.limit;
  if (updates.alertThreshold !== undefined) budget.alertThreshold = updates.alertThreshold;

  await budget.save();
  await evaluateBudgetAlerts(userId, `${budget.month}-01`);
  return budget.populate('category');
}

/**
 * Deletes a budget by ID.
 * @param {string} userId - User ObjectId.
 * @param {string} budgetId - Budget ObjectId.
 */
export async function deleteBudget(userId, budgetId) {
  const result = await Budget.findOneAndDelete({ _id: budgetId, user: userId });
  if (!result) {
    throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
  }
  return { message: 'Budget deleted successfully' };
}

/**
 * Calculates current spending and state ('ok' | 'warning' | 'exceeded') for each budget in a month.
 * @param {string} userId - User ObjectId.
 * @param {string} [month] - Month string 'YYYY-MM'. Defaults to current month.
 */
export async function getBudgetStatus(userId, month = getMonthString()) {
  const budgets = await Budget.find({ user: userId, month }).populate('category');

  const [yearStr, monthStr] = month.split('-');
  const startOfMonth = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1));
  const endOfMonth = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10), 0, 23, 59, 59, 999));

  const statusList = [];

  for (const b of budgets) {
    const matchQuery = {
      user: b.user,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };
    if (b.category) {
      matchQuery.category = b.category._id || b.category;
    }

    const agg = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent = agg.length > 0 ? agg[0].total : 0;
    const remaining = Math.max(0, b.limit - spent);
    const percent = Math.round((spent / b.limit) * 100 * 10) / 10;

    let state = 'ok';
    if (percent >= 100) {
      state = 'exceeded';
    } else if (percent >= b.alertThreshold) {
      state = 'warning';
    }

    statusList.push({
      budgetId: b._id,
      category: b.category,
      month: b.month,
      limit: b.limit,
      spent,
      remaining,
      percent,
      state,
      alertThreshold: b.alertThreshold,
    });
  }

  return statusList;
}
