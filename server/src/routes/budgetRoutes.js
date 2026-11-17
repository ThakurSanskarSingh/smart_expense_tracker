/**
 * @fileoverview Budget routing declarations.
 */

import { Router } from 'express';
import * as budgetController from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetMonthQuerySchema,
} from '../validators/budgetValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/status', validate(budgetMonthQuerySchema, 'query'), budgetController.getStatus);
router.get('/', validate(budgetMonthQuerySchema, 'query'), budgetController.list);
router.post('/', validate(createBudgetSchema), budgetController.upsert);
router.put('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
