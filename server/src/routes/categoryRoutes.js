/**
 * @fileoverview Category routing declarations.
 */

import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', categoryController.list);
router.post('/', validate(createCategorySchema), categoryController.create);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.remove);

export default router;
