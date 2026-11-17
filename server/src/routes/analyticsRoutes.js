/**
 * @fileoverview Analytics routing declarations.
 */

import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { monthQuerySchema, yearQuerySchema } from '../validators/analyticsValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', validate(monthQuerySchema, 'query'), analyticsController.getSummary);
router.get('/by-category', validate(monthQuerySchema, 'query'), analyticsController.getByCategory);
router.get('/monthly', validate(yearQuerySchema, 'query'), analyticsController.getMonthly);
router.get('/yearly', analyticsController.getYearly);
router.get('/budget-vs-actual', validate(monthQuerySchema, 'query'), analyticsController.getBudgetVsActual);

export default router;
