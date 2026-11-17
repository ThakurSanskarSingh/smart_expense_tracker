/**
 * @fileoverview Integration tests for Analytics aggregation pipelines.
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Analytics Aggregations', () => {
  const token = 'Bearer mock-token-analyticsuser';
  const month = '2026-11';
  let foodCat, billsCat;

  beforeEach(async () => {
    await request(app).post('/api/auth/sync').set('Authorization', token).send();
    const catRes = await request(app).get('/api/categories').set('Authorization', token);
    foodCat = catRes.body.data.find((c) => c.name === 'Food');
    billsCat = catRes.body.data.find((c) => c.name === 'Bills');

    // Seed expenses in month
    await request(app).post('/api/expenses').set('Authorization', token).send({
      amount: 1500,
      categoryId: foodCat._id,
      description: 'Monthly Food',
      date: '2026-11-05',
    });

    await request(app).post('/api/expenses').set('Authorization', token).send({
      amount: 500,
      categoryId: billsCat._id,
      description: 'Electricity Bill',
      date: '2026-11-15',
    });

    // Set budget
    await request(app).post('/api/budgets').set('Authorization', token).send({
      month,
      categoryId: foodCat._id,
      limit: 2000,
      alertThreshold: 80,
    });
  });

  it('GET /api/analytics/summary calculates metrics and top category', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', token)
      .query({ month });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSpent).toBe(2000);
    expect(res.body.data.expenseCount).toBe(2);
    expect(res.body.data.topCategory.name).toBe('Food');
    expect(res.body.data.topCategory.amount).toBe(1500);
  });

  it('GET /api/analytics/by-category returns breakdown', async () => {
    const res = await request(app)
      .get('/api/analytics/by-category')
      .set('Authorization', token)
      .query({ month });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    const foodItem = res.body.data.find((c) => c.name === 'Food');
    expect(foodItem.total).toBe(1500);
    expect(foodItem.percentage).toBe(75);
  });

  it('GET /api/analytics/monthly returns 12 months for year', async () => {
    const res = await request(app)
      .get('/api/analytics/monthly')
      .set('Authorization', token)
      .query({ year: '2026' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(12);
    const nov = res.body.data.find((m) => m.month === '2026-11');
    expect(nov.total).toBe(2000);
  });

  it('GET /api/analytics/budget-vs-actual compares budget to actual', async () => {
    const res = await request(app)
      .get('/api/analytics/budget-vs-actual')
      .set('Authorization', token)
      .query({ month });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].categoryName).toBe('Food');
    expect(res.body.data[0].budget).toBe(2000);
    expect(res.body.data[0].actual).toBe(1500);
    expect(res.body.data[0].difference).toBe(500);
    expect(res.body.data[0].isOver).toBe(false);
  });
});
