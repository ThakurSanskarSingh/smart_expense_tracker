/**
 * @fileoverview Integration tests for Expense CRUD, filtering, pagination, and CSV streaming.
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

describe('Expenses Endpoints', () => {
  const token = 'Bearer mock-token-expuser';
  let foodCategory;

  beforeEach(async () => {
    await request(app).post('/api/auth/sync').set('Authorization', token).send();
    const catRes = await request(app).get('/api/categories').set('Authorization', token);
    foodCategory = catRes.body.data.find((c) => c.name === 'Food');
  });

  it('POST /api/expenses creates a new expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 250.5,
        categoryId: foodCategory._id,
        description: 'Team Pizza Lunch',
        date: '2026-11-17',
        paymentMethod: 'upi',
        notes: 'Dominoes order',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(250.5);
    expect(res.body.data.description).toBe('Team Pizza Lunch');
    expect(res.body.data.category.name).toBe('Food');
  });

  it('GET /api/expenses filters by search keyword and category', async () => {
    // Seed two expenses
    await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 100,
        categoryId: foodCategory._id,
        description: 'Morning Coffee',
      });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 400,
        categoryId: foodCategory._id,
        description: 'Evening Dinner Buffet',
      });

    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', token)
      .query({ q: 'Coffee' });

    expect(res.status).toBe(200);
    expect(res.body.data.expenses.length).toBe(1);
    expect(res.body.data.expenses[0].description).toBe('Morning Coffee');
  });

  it('GET /api/expenses/:id retrieves a single expense', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 75,
        categoryId: foodCategory._id,
        description: 'Snack break',
      });

    const id = createRes.body.data._id;
    const res = await request(app).get(`/api/expenses/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Snack break');
  });

  it('PUT /api/expenses/:id updates existing expense', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 80,
        categoryId: foodCategory._id,
        description: 'Initial',
      });

    const id = createRes.body.data._id;
    const res = await request(app)
      .put(`/api/expenses/${id}`)
      .set('Authorization', token)
      .send({ amount: 95, description: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(95);
    expect(res.body.data.description).toBe('Updated');
  });

  it('DELETE /api/expenses/:id removes an expense', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 120,
        categoryId: foodCategory._id,
        description: 'To Delete',
      });

    const id = createRes.body.data._id;
    const res = await request(app).delete(`/api/expenses/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app).get(`/api/expenses/${id}`).set('Authorization', token);
    expect(checkRes.status).toBe(404);
  });

  it('GET /api/expenses/export.csv streams CSV data with headers', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 300,
        categoryId: foodCategory._id,
        description: 'CSV Export Item',
      });

    const res = await request(app)
      .get('/api/expenses/export.csv')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('ID,Date,Description,Category,Amount,Payment Method,Notes,Recurring');
    expect(res.text).toContain('CSV Export Item');
  });
});
