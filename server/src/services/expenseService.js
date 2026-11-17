/**
 * @fileoverview Expense management and data retrieval service.
 * Handles expense CRUD, multi-criteria filtering, pagination, and CSV export.
 */

import { Expense } from '../models/Expense.js';
import { Category } from '../models/Category.js';
import { evaluateBudgetAlerts } from './budgetService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Builds a MongoDB query object from incoming filter parameters.
 * @param {string} userId - User ObjectId.
 * @param {object} filters - Filter criteria.
 * @returns {object} MongoDB query filter.
 */
function buildExpenseQuery(userId, filters) {
  const query = { user: userId };

  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(filters.from);
    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      query.date.$lte = toDate;
    }
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) query.amount.$gte = Number(filters.minAmount);
    if (filters.maxAmount !== undefined) query.amount.$lte = Number(filters.maxAmount);
  }

  if (filters.q) {
    const regex = new RegExp(filters.q.trim(), 'i');
    query.$or = [{ description: regex }, { notes: regex }];
  }

  return query;
}

/**
 * Lists expenses with filtering, sorting, and pagination.
 * @param {string} userId - User ObjectId.
 * @param {object} params - Filter and pagination options.
 */
export async function getExpenses(userId, params) {
  const query = buildExpenseQuery(userId, params);
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(params.limit || '10', 10)));
  const skip = (page - 1) * limit;

  // Sorting parser: e.g. "-date", "amount"
  let sortOption = { date: -1 };
  if (params.sort) {
    const isDesc = params.sort.startsWith('-');
    const field = isDesc ? params.sort.substring(1) : params.sort;
    sortOption = { [field]: isDesc ? -1 : 1 };
  }

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .populate('category', 'name color icon')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(query),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Creates a new expense and triggers budget alert evaluation.
 * @param {string} userId - User ObjectId.
 * @param {object} payload - Expense fields.
 */
export async function createExpense(userId, payload) {
  const category = await Category.findOne({ _id: payload.categoryId, user: userId });
  if (!category) {
    throw new AppError('Category not found or does not belong to user', 404, 'CATEGORY_NOT_FOUND');
  }

  const expense = await Expense.create({
    user: userId,
    amount: payload.amount,
    category: category._id,
    description: payload.description.trim(),
    date: payload.date || new Date(),
    paymentMethod: payload.paymentMethod || 'upi',
    notes: payload.notes || '',
    recurring: payload.recurring || { enabled: false, frequency: 'monthly', nextDue: null },
  });

  // Recompute that month's budget status
  await evaluateBudgetAlerts(userId, expense.date);

  return expense.populate('category', 'name color icon');
}

/**
 * Retrieves a single expense by ID.
 * @param {string} userId - User ObjectId.
 * @param {string} expenseId - Expense ObjectId.
 */
export async function getExpenseById(userId, expenseId) {
  const expense = await Expense.findOne({ _id: expenseId, user: userId }).populate('category', 'name color icon');
  if (!expense) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
  }
  return expense;
}

/**
 * Updates an existing expense and triggers budget alert re-evaluation.
 * @param {string} userId - User ObjectId.
 * @param {string} expenseId - Expense ObjectId.
 * @param {object} updates - Fields to update.
 */
export async function updateExpense(userId, expenseId, updates) {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
  }

  if (updates.categoryId) {
    const category = await Category.findOne({ _id: updates.categoryId, user: userId });
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    expense.category = category._id;
  }

  if (updates.amount !== undefined) expense.amount = updates.amount;
  if (updates.description !== undefined) expense.description = updates.description.trim();
  if (updates.date !== undefined) expense.date = updates.date;
  if (updates.paymentMethod !== undefined) expense.paymentMethod = updates.paymentMethod;
  if (updates.notes !== undefined) expense.notes = updates.notes;
  if (updates.recurring !== undefined) expense.recurring = updates.recurring;

  await expense.save();

  // Recompute budget status for the updated expense month
  await evaluateBudgetAlerts(userId, expense.date);

  return expense.populate('category', 'name color icon');
}

/**
 * Deletes an expense by ID and re-evaluates budget status.
 * @param {string} userId - User ObjectId.
 * @param {string} expenseId - Expense ObjectId.
 */
export async function deleteExpense(userId, expenseId) {
  const expense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });
  if (!expense) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
  }

  // Re-evaluate budget status for the month
  await evaluateBudgetAlerts(userId, expense.date);

  return { message: 'Expense deleted successfully' };
}

/**
 * Streams filtered expenses as a CSV file to the HTTP response stream.
 * @param {string} userId - User ObjectId.
 * @param {object} filters - Filter criteria.
 * @param {import('express').Response} res - Express response stream.
 */
export async function streamExpensesCSV(userId, filters, res) {
  const query = buildExpenseQuery(userId, filters);
  const cursor = Expense.find(query).populate('category', 'name').sort({ date: -1 }).cursor();

  const timestamp = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="expenses-${timestamp}.csv"`);

  // Write CSV header
  res.write('ID,Date,Description,Category,Amount,Payment Method,Notes,Recurring\r\n');

  for await (const doc of cursor) {
    const cleanId = doc._id.toString();
    const cleanDate = doc.date ? new Date(doc.date).toISOString().split('T')[0] : '';
    const cleanDesc = `"${(doc.description || '').replace(/"/g, '""')}"`;
    const cleanCat = `"${(doc.category?.name || 'Uncategorized').replace(/"/g, '""')}"`;
    const cleanAmount = doc.amount.toFixed(2);
    const cleanMethod = doc.paymentMethod || 'upi';
    const cleanNotes = `"${(doc.notes || '').replace(/"/g, '""')}"`;
    const isRecurring = doc.recurring?.enabled ? `Yes (${doc.recurring.frequency})` : 'No';

    res.write(`${cleanId},${cleanDate},${cleanDesc},${cleanCat},${cleanAmount},${cleanMethod},${cleanNotes},${isRecurring}\r\n`);
  }

  res.end();
}
