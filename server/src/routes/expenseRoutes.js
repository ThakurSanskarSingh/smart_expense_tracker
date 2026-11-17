/**
 * @fileoverview Expense routing declarations.
 */

import { Router } from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from '../validators/expenseValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/export.csv', expenseController.exportCSV);
router.get('/', validate(listExpensesQuerySchema, 'query'), expenseController.list);
router.post('/', validate(createExpenseSchema), expenseController.create);
router.get('/:id', expenseController.getById);
router.put('/:id', validate(updateExpenseSchema), expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
