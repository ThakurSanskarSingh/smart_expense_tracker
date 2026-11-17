/**
 * @fileoverview Database demo seeder script.
 * Populates MongoDB with a test user and 6 months of realistic historical expenses,
 * category budgets, and recurring subscriptions for presentations and viva demos.
 */

import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Category, DEFAULT_CATEGORIES } from '../models/Category.js';
import { Expense } from '../models/Expense.js';
import { Budget } from '../models/Budget.js';
import { Notification } from '../models/Notification.js';

const DEMO_UID = 'demo-user-group41';
const DEMO_EMAIL = 'demo@kiet.edu';

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(config.mongodbUri);
  console.log('[Seed] Database connected.');

  try {
    // 1. Clean previous demo data
    let user = await User.findOne({ uid: DEMO_UID });
    if (user) {
      console.log('[Seed] Purging existing demo data...');
      await Expense.deleteMany({ user: user._id });
      await Budget.deleteMany({ user: user._id });
      await Notification.deleteMany({ user: user._id });
      await Category.deleteMany({ user: user._id });
      await User.deleteOne({ _id: user._id });
    }

    // 2. Create demo user
    console.log('[Seed] Creating demo user...');
    user = await User.create({
      uid: DEMO_UID,
      email: DEMO_EMAIL,
      name: 'Group 41 Demo User',
      currency: 'INR',
      theme: 'dark',
    });

    // 3. Seed default categories
    console.log('[Seed] Seeding default categories...');
    const catDocs = DEFAULT_CATEGORIES.map((c) => ({
      user: user._id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      isDefault: true,
    }));
    const categories = await Category.insertMany(catDocs);
    const catMap = new Map(categories.map((c) => [c.name, c._id]));

    // 4. Generate past 6 months of dates
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ year: d.getFullYear(), monthNum: d.getMonth(), str: mStr });
    }

    console.log(`[Seed] Seeding data across 6 months: ${months.map((m) => m.str).join(', ')}...`);

    // 5. Seed budgets for each month
    for (const m of months) {
      await Budget.create([
        { user: user._id, category: null, month: m.str, limit: 35000, alertThreshold: 80 },
        { user: user._id, category: catMap.get('Food'), month: m.str, limit: 12000, alertThreshold: 80 },
        { user: user._id, category: catMap.get('Shopping'), month: m.str, limit: 8000, alertThreshold: 85 },
        { user: user._id, category: catMap.get('Entertainment'), month: m.str, limit: 4000, alertThreshold: 75 },
      ]);
    }

    // 6. Seed recurring expense templates
    const recurringExpenses = [
      {
        user: user._id,
        amount: 649,
        category: catMap.get('Entertainment'),
        description: 'Netflix 4K Subscription',
        paymentMethod: 'card',
        recurring: { enabled: true, frequency: 'monthly', nextDue: new Date(now.getFullYear(), now.getMonth() + 1, 5) },
      },
      {
        user: user._id,
        amount: 8000,
        category: catMap.get('Rent'),
        description: 'Hostel / Apartment Rent',
        paymentMethod: 'netbanking',
        recurring: { enabled: true, frequency: 'monthly', nextDue: new Date(now.getFullYear(), now.getMonth() + 1, 1) },
      },
      {
        user: user._id,
        amount: 1199,
        category: catMap.get('Bills'),
        description: 'Airtel Fiber Broadband',
        paymentMethod: 'upi',
        recurring: { enabled: true, frequency: 'monthly', nextDue: new Date(now.getFullYear(), now.getMonth() + 1, 10) },
      },
    ];
    await Expense.insertMany(recurringExpenses);

    // 7. Seed historical expenses across the 6 months
    const sampleItems = [
      { cat: 'Food', desc: 'College Canteen Lunch', min: 120, max: 250, method: 'upi' },
      { cat: 'Food', desc: 'Grocery Mart Vegetables & Milk', min: 450, max: 1200, method: 'upi' },
      { cat: 'Food', desc: 'Dinner with Project Teammates', min: 600, max: 1800, method: 'card' },
      { cat: 'Transport', desc: 'Delhi Metro SmartCard Recharge', min: 200, max: 500, method: 'upi' },
      { cat: 'Transport', desc: 'Auto / Cab to Campus', min: 90, max: 320, method: 'cash' },
      { cat: 'Shopping', desc: 'Books & Stationery for Semester', min: 350, max: 950, method: 'card' },
      { cat: 'Shopping', desc: 'Clothing & Footwear', min: 1200, max: 3500, method: 'card' },
      { cat: 'Bills', desc: 'Mobile Postpaid Plan', min: 399, max: 599, method: 'upi' },
      { cat: 'Entertainment', desc: 'Movie Tickets (IMAX)', min: 350, max: 800, method: 'card' },
      { cat: 'Health', desc: 'Pharmacy Medicines & Vitamins', min: 180, max: 650, method: 'upi' },
      { cat: 'Other', desc: 'Printouts & Project Binding', min: 80, max: 240, method: 'cash' },
    ];

    const historicalExpenses = [];

    for (const m of months) {
      // 18-24 expenses per month
      const count = Math.floor(Math.random() * 7) + 18;
      for (let i = 0; i < count; i++) {
        const item = sampleItems[Math.floor(Math.random() * sampleItems.length)];
        const amount = Math.floor(Math.random() * (item.max - item.min) + item.min);
        const day = Math.floor(Math.random() * 26) + 1;
        const date = new Date(m.year, m.monthNum, day, Math.floor(Math.random() * 12) + 9);

        historicalExpenses.push({
          user: user._id,
          amount,
          category: catMap.get(item.cat),
          description: item.desc,
          date,
          paymentMethod: item.method,
          notes: 'Sample historical demo transaction',
          recurring: { enabled: false },
        });
      }
    }

    await Expense.insertMany(historicalExpenses);

    // 8. Seed sample notifications
    await Notification.create([
      {
        user: user._id,
        type: 'budget_warning',
        message: 'Warning: Food budget has reached 84% of spending limit (₹12,000).',
        read: false,
        meta: { month: months[months.length - 1].str, limit: 12000, spent: 10080 },
      },
      {
        user: user._id,
        type: 'recurring_added',
        message: 'Auto-recorded recurring payment: Netflix 4K Subscription (₹649).',
        read: true,
      },
    ]);

    console.log(`[Seed] SUCCESS! Created demo user: ${DEMO_EMAIL}`);
    console.log(`[Seed] Populated ${historicalExpenses.length} transactions across 6 months.`);
    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
}

seed();
