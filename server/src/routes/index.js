/**
 * @fileoverview Main API router aggregator.
 * Mounts all sub-routers with '/api' prefix and provides public health check.
 */

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import insightRoutes from './insightRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

// Public health endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Smart Expense Tracker API (Group 41)',
    },
  });
});

// Mounted feature routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/insights', insightRoutes);
router.use('/notifications', notificationRoutes);

export default router;
