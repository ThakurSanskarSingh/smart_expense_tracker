/**
 * @fileoverview Integration tests for Health, Auth Sync, and User Profile endpoints.
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { Category } from '../src/models/Category.js';

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Health Check Endpoint', () => {
  it('GET /api/health returns 200 with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });
});

describe('Authentication & User Profile', () => {
  const token = 'Bearer mock-token-user123';

  it('rejects unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/sync creates new user and seeds 10 default categories', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', token)
      .send({ currency: 'INR', theme: 'dark' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isNewUser).toBe(true);
    expect(res.body.data.user.email).toBe('user123@kiet.edu');

    // Verify 10 default categories were seeded
    const categories = await Category.find({ user: res.body.data.user.id });
    expect(categories.length).toBe(10);
    expect(categories.some((c) => c.name === 'Food' && c.isDefault)).toBe(true);
    expect(categories.some((c) => c.name === 'Other' && c.isDefault)).toBe(true);
  });

  it('GET /api/users/me retrieves current user profile after sync', async () => {
    // First sync
    await request(app).post('/api/auth/sync').set('Authorization', token).send();

    // Then retrieve
    const res = await request(app).get('/api/users/me').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('user123@kiet.edu');
  });

  it('PUT /api/users/me updates profile settings', async () => {
    await request(app).post('/api/auth/sync').set('Authorization', token).send();

    const updateRes = await request(app)
      .put('/api/users/me')
      .set('Authorization', token)
      .send({ name: 'Sanskar Gupta', currency: 'USD', theme: 'light' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Sanskar Gupta');
    expect(updateRes.body.data.currency).toBe('USD');
    expect(updateRes.body.data.theme).toBe('light');
  });
});
