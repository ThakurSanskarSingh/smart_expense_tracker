/**
 * @fileoverview Financial insights routing declarations.
 */

import { Router } from 'express';
import * as insightController from '../controllers/insightController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { monthQuerySchema } from '../validators/analyticsValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(monthQuerySchema, 'query'), insightController.getInsights);

export default router;
