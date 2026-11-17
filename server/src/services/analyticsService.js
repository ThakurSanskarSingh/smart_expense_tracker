/**
 * @fileoverview Analytics service providing MongoDB aggregation pipelines for metrics and visual charts.
 */

import mongoose from 'mongoose';
import { Expense } from '../models/Expense.js';
import { Budget } from '../models/Budget.js';
import { getMonthString } from './budgetService.js';

/**
 * Calculates start and end Date objects for a given 'YYYY-MM' string.
 * @param {string} monthStr - 'YYYY-MM'
 * @returns {{ start: Date, end: Date, daysInMonth: number }}
 */
function getMonthBounds(monthStr) {
  const [yearStr, mStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const daysInMonth = new Date(year, month, 0).getDate();
  return { start, end, daysInMonth };
}

/**
 * Calculates previous month string in 'YYYY-MM' format.
 * @param {string} monthStr - 'YYYY-MM'
 * @returns {string}
 */
function getPreviousMonthString(monthStr) {
  const [yearStr, mStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(mStr, 10) - 1;
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Computes monthly KPI summary: total, count, avg per day, change vs previous month %, top category.
 * @param {string} userId - User ObjectId.
 * @param {string} [month] - Month string 'YYYY-MM'.
 */
export async function getSummary(userId, month = getMonthString()) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { start, end, daysInMonth } = getMonthBounds(month);
  const prevMonthStr = getPreviousMonthString(month);
  const prevBounds = getMonthBounds(prevMonthStr);

  const [currentAgg, prevAgg, topCategoryAgg] = await Promise.all([
    // Current month aggregate
    Expense.aggregate([
      { $match: { user: userObjectId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
        },
      },
    ]),

    // Previous month aggregate
    Expense.aggregate([
      { $match: { user: userObjectId, date: { $gte: prevBounds.start, $lte: prevBounds.end } } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]),

    // Top category in current month
    Expense.aggregate([
      { $match: { user: userObjectId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
    ]),
  ]);

  const totalSpent = currentAgg.length > 0 ? currentAgg[0].totalSpent : 0;
  const expenseCount = currentAgg.length > 0 ? currentAgg[0].expenseCount : 0;
  const prevTotal = prevAgg.length > 0 ? prevAgg[0].totalSpent : 0;

  // Average per day
  const avgPerDay = daysInMonth > 0 ? Math.round((totalSpent / daysInMonth) * 100) / 100 : 0;

  // Percentage change vs previous month
  let changePercentage = 0;
  if (prevTotal > 0) {
    changePercentage = Math.round(((totalSpent - prevTotal) / prevTotal) * 100 * 10) / 10;
  } else if (totalSpent > 0) {
    changePercentage = 100;
  }

  // Top category details
  let topCategory = null;
  if (topCategoryAgg.length > 0) {
    const top = topCategoryAgg[0];
    const catPercent = totalSpent > 0 ? Math.round((top.total / totalSpent) * 100 * 10) / 10 : 0;
    topCategory = {
      id: top._id,
      name: top.categoryInfo.name,
      color: top.categoryInfo.color,
      icon: top.categoryInfo.icon,
      amount: top.total,
      percentage: catPercent,
    };
  }

  return {
    month,
    totalSpent,
    expenseCount,
    avgPerDay,
    previousMonthTotal: prevTotal,
    changePercentage,
    topCategory,
  };
}

/**
 * Breakdown of expenditures by category for a specific month.
 * @param {string} userId - User ObjectId.
 * @param {string} [month] - Month string 'YYYY-MM'.
 */
export async function getByCategory(userId, month = getMonthString()) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { start, end } = getMonthBounds(month);

  const results = await Expense.aggregate([
    { $match: { user: userObjectId, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
  ]);

  const grandTotal = results.reduce((acc, curr) => acc + curr.total, 0);

  return results.map((item) => ({
    categoryId: item._id,
    name: item.categoryInfo.name,
    color: item.categoryInfo.color,
    icon: item.categoryInfo.icon,
    total: item.total,
    count: item.count,
    percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100 * 10) / 10 : 0,
  }));
}

/**
 * 12-month spending totals for a given calendar year.
 * @param {string} userId - User ObjectId.
 * @param {string} [year] - Calendar year 'YYYY'. Defaults to current year.
 */
export async function getMonthly(userId, year = new Date().getFullYear().toString()) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const yearInt = parseInt(year, 10);
  const startOfYear = new Date(Date.UTC(yearInt, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(yearInt, 11, 31, 23, 59, 59, 999));

  const agg = await Expense.aggregate([
    { $match: { user: userObjectId, date: { $gte: startOfYear, $lte: endOfYear } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(agg.map((item) => [item._id, item]));
  const months = [];

  for (let m = 1; m <= 12; m++) {
    const key = `${yearInt}-${String(m).padStart(2, '0')}`;
    const found = map.get(key);
    months.push({
      month: key,
      total: found ? found.total : 0,
      count: found ? found.count : 0,
    });
  }

  return months;
}

/**
 * Multi-year spending summary for historical analytics.
 * @param {string} userId - User ObjectId.
 */
export async function getYearly(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  return Expense.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: { $year: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id',
        total: 1,
        count: 1,
      },
    },
  ]);
}

/**
 * Compares budget limits against actual spending across categories for a given month.
 * @param {string} userId - User ObjectId.
 * @param {string} [month] - Month string 'YYYY-MM'.
 */
export async function getBudgetVsActual(userId, month = getMonthString()) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { start, end } = getMonthBounds(month);

  const [budgets, actuals] = await Promise.all([
    Budget.find({ user: userObjectId, month }).populate('category'),
    Expense.aggregate([
      { $match: { user: userObjectId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$category',
          actual: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const actualMap = new Map(actuals.map((a) => [a._id ? a._id.toString() : null, a.actual]));

  return budgets.map((b) => {
    const catId = b.category ? b.category._id.toString() : null;
    const actual = catId ? actualMap.get(catId) || 0 : actuals.reduce((acc, curr) => acc + curr.actual, 0);
    const diff = b.limit - actual;

    return {
      budgetId: b._id,
      categoryId: b.category ? b.category._id : null,
      categoryName: b.category ? b.category.name : 'Overall Budget',
      categoryColor: b.category ? b.category.color : '#3B82F6',
      budget: b.limit,
      actual,
      difference: diff,
      isOver: actual > b.limit,
      percentUsed: Math.round((actual / b.limit) * 100 * 10) / 10,
    };
  });
}
