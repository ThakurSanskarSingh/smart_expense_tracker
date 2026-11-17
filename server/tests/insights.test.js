/**
 * @fileoverview Integration tests for Financial Insights engine and rules evaluation.
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

describe('Smart Financial Insights', () => {
  const token = 'Bearer mock-token-insightuser';
  const month = '2026-11';

  beforeEach(async () => {
    await request(app).post('/api/auth/sync').set('Authorization', token).send();
    const catRes = await request(app).get('/api/categories').set('Authorization', token);
    const foodCat = catRes.body.data.find((c) => c.name === 'Food');
    const travelCat = catRes.body.data.find((c) => c.name === 'Travel');

    // Create expenses: Food 80%, Travel 20%
    await request(app).post('/api/expenses').set('Authorization', token).send({
      amount: 4000,
      categoryId: foodCat._id,
      description: 'Dining out and groceries',
      date: '2026-11-04',
    });

    await request(app).post('/api/expenses').set('Authorization', token).send({
      amount: 1000,
      categoryId: travelCat._id,
      description: 'Train tickets',
      date: '2026-11-08',
    });
  });

  it('GET /api/insights returns rule-based recommendations with structure', async () => {
    const res = await request(app)
      .get('/api/insights')
      .set('Authorization', token)
      .query({ month });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.source).toBe('rules');
    expect(Array.isArray(res.body.data.tips)).toBe(true);
    expect(res.body.data.tips.length).toBeGreaterThanOrEqual(1);

    // Food is 80% (>40%), so category_dominance rule should trigger
    const dominanceTip = res.body.data.tips.find((t) => t.type === 'category_dominance');
    expect(dominanceTip).toBeDefined();
    expect(dominanceTip.severity).toBe('warning');
    expect(dominanceTip.title).toContain('Food');
  });
});
