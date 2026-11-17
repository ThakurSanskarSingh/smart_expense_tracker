/**
 * @fileoverview Integration tests for Budget limits, status computations, and proactive alert notifications.
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { Notification } from '../src/models/Notification.js';

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Budgets & Proactive Threshold Notifications', () => {
  const token = 'Bearer mock-token-budgetuser';
  const month = '2026-11';
  let foodCat;
  let user;

  beforeEach(async () => {
    const authRes = await request(app).post('/api/auth/sync').set('Authorization', token).send();
    user = authRes.body.data.user;
    const catRes = await request(app).get('/api/categories').set('Authorization', token);
    foodCat = catRes.body.data.find((c) => c.name === 'Food');
  });

  it('POST /api/budgets upserts a category spending limit', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', token)
      .send({
        month,
        categoryId: foodCat._id,
        limit: 1000,
        alertThreshold: 80,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.limit).toBe(1000);
    expect(res.body.data.alertThreshold).toBe(80);
  });

  it('GET /api/budgets/status returns spent, percentage, and states', async () => {
    // 1. Set budget 1000 for Food
    await request(app)
      .post('/api/budgets')
      .set('Authorization', token)
      .send({
        month,
        categoryId: foodCat._id,
        limit: 1000,
        alertThreshold: 80,
      });

    // 2. Add expense of 850 in that month
    await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 850,
        categoryId: foodCat._id,
        description: 'Groceries',
        date: '2026-11-10',
      });

    // 3. Check status
    const statusRes = await request(app)
      .get('/api/budgets/status')
      .set('Authorization', token)
      .query({ month });

    expect(statusRes.status).toBe(200);
    const item = statusRes.body.data.find((b) => b.category?._id === foodCat._id);
    expect(item).toBeDefined();
    expect(item.spent).toBe(850);
    expect(item.percent).toBe(85);
    expect(item.state).toBe('warning');

    // 4. Verify budget_warning notification was created
    const notifs = await Notification.find({ user: user.id, type: 'budget_warning' });
    expect(notifs.length).toBe(1);
    expect(notifs[0].message).toContain('Warning: Food budget reached 85%');
  });

  it('triggers budget_exceeded notification when spending hits 100%', async () => {
    // 1. Set budget 500 for Food
    await request(app)
      .post('/api/budgets')
      .set('Authorization', token)
      .send({
        month,
        categoryId: foodCat._id,
        limit: 500,
        alertThreshold: 80,
      });

    // 2. Add expense of 550
    await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 550,
        categoryId: foodCat._id,
        description: 'Exceeding Dinner',
        date: '2026-11-12',
      });

    const notifs = await Notification.find({ user: user.id, type: 'budget_exceeded' });
    expect(notifs.length).toBe(1);
    expect(notifs[0].message).toContain('Food budget exceeded!');
  });
});
