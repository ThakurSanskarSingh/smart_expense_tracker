/**
 * @fileoverview Smart financial insights engine with LLM provider (Gemini / OpenAI)
 * and deterministic rules-based fallback.
 */

import { z } from 'zod';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { getSummary, getByCategory } from './analyticsService.js';
import { getBudgets, getMonthString } from './budgetService.js';
import { Expense } from '../models/Expense.js';

const tipsSchema = z.array(
  z.object({
    type: z.string(),
    title: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'danger']),
  }),
);

/**
 * Deterministic financial rule engine that checks for budget overruns,
 * excessive category concentration, recurring burdens, and saving opportunities.
 * @param {object} context
 * @returns {Array<{ type: string, title: string, message: string, severity: 'info'|'warning'|'danger' }>}
 */
export function evaluateRuleBasedInsights(context) {
  const { summary, categoryBreakdown, recurringTotal, daysWithNoSpend } = context;
  const tips = [];

  // Rule 1: Category Dominance (>40% of monthly spending)
  if (categoryBreakdown && categoryBreakdown.length > 0) {
    const dominant = categoryBreakdown[0];
    if (dominant.percentage > 40 && summary.totalSpent > 0) {
      tips.push({
        type: 'category_dominance',
        title: `High ${dominant.name} Expenditure`,
        message: `${dominant.name} represents ${dominant.percentage}% of all expenses this month (₹${dominant.total.toLocaleString()}). Look for ways to trim discretionary spending here.`,
        severity: 'warning',
      });
    }
  }

  // Rule 2: Month-over-Month Surge (>20% increase)
  if (summary.changePercentage > 20 && summary.previousMonthTotal > 0) {
    tips.push({
      type: 'spending_surge',
      title: 'Spending Increased Significantly',
      message: `Your spending grew by ${summary.changePercentage}% compared to last month. Review your recent transactions to curb unbudgeted purchases.`,
      severity: 'warning',
    });
  }

  // Rule 3: Zero-Spend Days
  if (daysWithNoSpend > 0) {
    tips.push({
      type: 'no_spend_streak',
      title: 'Zero-Spend Discipline',
      message: `You achieved ${daysWithNoSpend} zero-spend ${daysWithNoSpend === 1 ? 'day' : 'days'} this month! Pausing non-essential purchases on select days builds strong savings habits.`,
      severity: 'info',
    });
  }

  // Rule 4: Recurring Commitments Share (>30% of total)
  if (summary.totalSpent > 0 && recurringTotal > 0) {
    const recurringShare = Math.round((recurringTotal / summary.totalSpent) * 100);
    if (recurringShare > 30) {
      tips.push({
        type: 'recurring_burden',
        title: 'High Fixed & Recurring Commitments',
        message: `Recurring expenses and subscriptions constitute ${recurringShare}% of your total outflow (₹${recurringTotal.toLocaleString()}). Audit recurring subscriptions to cancel unused services.`,
        severity: 'warning',
      });
    }
  }

  // Rule 5: Budget Status Alert
  if (context.overBudgetCount > 0) {
    tips.push({
      type: 'budget_overrun',
      title: 'Budget Limit Exceeded',
      message: `${context.overBudgetCount} budget ${context.overBudgetCount === 1 ? 'category has' : 'categories have'} exceeded spending limits this month.`,
      severity: 'danger',
    });
  }

  // Rule 6: General Positive Saving Tip
  if (tips.length < 3) {
    tips.push({
      type: 'savings_tip',
      title: 'Automate Your Savings',
      message: 'Aim to follow the 50/30/20 rule: allocate 50% for needs, 30% for wants, and 20% directly into emergency funds or investments.',
      severity: 'info',
    });
  }

  return tips;
}

/**
 * Calls configured LLM provider with aggregated statistics to generate actionable tips.
 * @param {object} context - Aggregated financial context.
 * @returns {Promise<Array<{ type: string, title: string, message: string, severity: string }>>}
 */
async function callLLMProvider(context) {
  const provider = config.ai.provider;
  const apiKey = config.ai.apiKey;

  if (provider === 'none' || !apiKey) {
    throw new Error('AI Provider not configured');
  }

  const prompt = `You are a financial advisor for Smart Expense Tracker.
Analyze these aggregated monthly expense numbers (no personal info):
Total spent: ${context.summary.totalSpent}
Transactions: ${context.summary.expenseCount}
Change vs last month: ${context.summary.changePercentage}%
Top category: ${context.summary.topCategory ? context.summary.topCategory.name + ' (' + context.summary.topCategory.percentage + '%)' : 'None'}
Recurring total: ${context.recurringTotal}
Categories: ${JSON.stringify(context.categoryBreakdown.map((c) => ({ name: c.name, total: c.total, percent: c.percentage })))}

Provide exactly 3 to 4 concise, practical financial recommendations.
Return ONLY valid JSON matching this exact structure:
[
  {
    "type": "string",
    "title": "Short title",
    "message": "Specific actionable insight in 1-2 sentences",
    "severity": "info" | "warning" | "danger"
  }
]`;

  let responseText = '';

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const json = await response.json();
    responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else if (provider === 'openai') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || '{}';
    const parsedObj = JSON.parse(content);
    // If output wrapped in a key like { "tips": [...] }, unwrap it
    responseText = Array.isArray(parsedObj) ? JSON.stringify(parsedObj) : JSON.stringify(parsedObj.tips || Object.values(parsedObj)[0] || []);
  }

  // Parse and validate with Zod
  const rawData = JSON.parse(responseText.trim());
  const validated = tipsSchema.parse(Array.isArray(rawData) ? rawData : rawData.tips);
  return validated;
}

/**
 * Generates personalized financial insights using AI with rule-based fallback.
 * @param {string} userId - User ObjectId.
 * @param {string} [month] - Month string 'YYYY-MM'.
 * @returns {Promise<{ tips: Array<object>, source: 'llm' | 'rules' }>}
 */
export async function getInsights(userId, month = getMonthString()) {
  const [summary, categoryBreakdown, budgets] = await Promise.all([
    getSummary(userId, month),
    getByCategory(userId, month),
    getBudgets(userId, month),
  ]);

  // Aggregate recurring expenses
  const [yearStr, mStr] = month.split('-');
  const start = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(mStr, 10) - 1, 1));
  const end = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(mStr, 10), 0, 23, 59, 59, 999));

  const recurringAgg = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        'recurring.enabled': true,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const recurringTotal = recurringAgg.length > 0 ? recurringAgg[0].total : 0;

  // Calculate days with no spend
  const distinctSpendDays = await Expense.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
  ]);
  const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(mStr, 10), 0).getDate();
  const daysWithNoSpend = Math.max(0, daysInMonth - distinctSpendDays.length);

  // Count over-budget items
  let overBudgetCount = 0;
  for (const b of budgets) {
    const actual = b.category
      ? categoryBreakdown.find((c) => c.categoryId.toString() === b.category._id.toString())?.total || 0
      : summary.totalSpent;
    if (actual > b.limit) overBudgetCount += 1;
  }

  const context = {
    summary,
    categoryBreakdown,
    recurringTotal,
    daysWithNoSpend,
    overBudgetCount,
  };

  // Attempt LLM call if configured
  if (config.ai.provider !== 'none' && config.ai.apiKey) {
    try {
      const tips = await callLLMProvider(context);
      if (tips && tips.length > 0) {
        return { tips, source: 'llm' };
      }
    } catch {
      // Graceful fallback to rule-based insights
    }
  }

  // Fallback to rules engine
  const tips = evaluateRuleBasedInsights(context);
  return { tips, source: 'rules' };
}
