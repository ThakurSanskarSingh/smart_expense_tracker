/**
 * @fileoverview Background cron job for automated recurring expense processing.
 * Runs daily at 00:05 to instantiate due transactions, advance next due dates,
 * and dispatch notifications.
 */

import cron from 'node-cron';
import { Expense } from '../models/Expense.js';
import { Notification } from '../models/Notification.js';
import { evaluateBudgetAlerts } from '../services/budgetService.js';
import { logger } from '../utils/logger.js';

/**
 * Calculates the next due date based on frequency.
 * @param {Date} currentDate
 * @param {'daily'|'weekly'|'monthly'|'yearly'} frequency
 * @returns {Date}
 */
export function calculateNextDueDate(currentDate, frequency) {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Scans for due recurring expenses, generates corresponding transaction records,
 * increments the next due timestamp, and creates user notifications.
 * @returns {Promise<{ processedCount: number }>}
 */
export async function runRecurringJobOnce() {
  const now = new Date();
  const dueExpenses = await Expense.find({
    'recurring.enabled': true,
    'recurring.nextDue': { $lte: now },
  });

  let processedCount = 0;

  for (const template of dueExpenses) {
    try {
      // 1. Create the new expense record
      const newExpense = await Expense.create({
        user: template.user,
        amount: template.amount,
        category: template.category,
        description: template.description,
        date: now,
        paymentMethod: template.paymentMethod,
        notes: `Auto-recorded recurring payment (Ref: ${template._id})`,
        recurring: { enabled: false }, // Spawned transaction is not itself recurring
      });

      // 2. Advance the template's nextDue date
      const nextDue = calculateNextDueDate(template.recurring.nextDue || now, template.recurring.frequency);
      template.recurring.nextDue = nextDue;
      await template.save();

      // 3. Create notification
      await Notification.create({
        user: template.user,
        type: 'recurring_added',
        message: `Auto-recorded recurring expense: ${template.description} (₹${template.amount.toLocaleString()}).`,
        meta: {
          expenseId: newExpense._id.toString(),
          originalTemplateId: template._id.toString(),
          amount: template.amount,
        },
      });

      // 4. Trigger budget evaluation
      await evaluateBudgetAlerts(template.user, now);

      processedCount += 1;
    } catch (err) {
      logger.error(`Failed to process recurring expense ${template._id}:`, err);
    }
  }

  return { processedCount };
}

/**
 * Initializes the daily cron schedule (00:05 AM).
 * @returns {cron.ScheduledTask}
 */
export function startRecurringCronJob() {
  // Run at 00:05 every day
  const task = cron.schedule('5 0 * * *', async () => {
    logger.info('[Cron] Executing daily recurring expenses check...');
    const result = await runRecurringJobOnce();
    logger.info(`[Cron] Completed recurring expenses check. Created: ${result.processedCount}`);
  });

  return task;
}
