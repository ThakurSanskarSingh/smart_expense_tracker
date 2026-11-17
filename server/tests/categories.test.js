/**
 * @fileoverview Integration tests for Category management and safe deletion reassignment.
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { Expense } from '../src/models/Expense.js';

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Category CRUD & Protected Deletion', () => {
  const token = 'Bearer mock-token-catuser';

  beforeEach(async () => {
    await request(app).post('/api/auth/sync').set('Authorization', token).send();
  });

  it('GET /api/categories lists all user categories', async () => {
    const res = await request(app).get('/api/categories').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(10);
  });

  it('POST /api/categories creates a new custom category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', token)
      .send({ name: 'Gaming & Gadgets', color: '#8B5CF6', icon: 'gamepad' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Gaming & Gadgets');
    expect(res.body.data.isDefault).toBe(false);
  });

  it('PUT /api/categories/:id updates an existing category', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', token)
      .send({ name: 'Old Name', color: '#10B981', icon: 'tag' });

    const catId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/categories/${catId}`)
      .set('Authorization', token)
      .send({ name: 'New Name', color: '#06B6D4' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('New Name');
    expect(updateRes.body.data.color).toBe('#06B6D4');
  });

  it('DELETE /api/categories/:id fails for default category', async () => {
    const listRes = await request(app).get('/api/categories').set('Authorization', token);
    const defaultCat = listRes.body.data.find((c) => c.isDefault);

    const deleteRes = await request(app)
      .delete(`/api/categories/${defaultCat._id}`)
      .set('Authorization', token);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.success).toBe(false);
  });

  it('DELETE custom category reassigns its expenses to Other', async () => {
    // 1. Create custom category
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', token)
      .send({ name: 'Temporary', color: '#F59E0B' });
    const tempCatId = catRes.body.data._id;

    // 2. Create expense using this category
    const expRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', token)
      .send({
        amount: 500,
        categoryId: tempCatId,
        description: 'Test Expense in Temp Category',
      });
    const expenseId = expRes.body.data._id;

    // 3. Delete the custom category
    const delRes = await request(app)
      .delete(`/api/categories/${tempCatId}`)
      .set('Authorization', token);
    expect(delRes.status).toBe(200);

    // 4. Verify the expense category is now reassigned to "Other"
    const expUpdated = await Expense.findById(expenseId).populate('category');
    expect(expUpdated.category.name).toBe('Other');
  });
});
