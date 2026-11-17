/**
 * @fileoverview Authentication routing declarations.
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { syncUserSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/sync', requireAuth, validate(syncUserSchema), authController.sync);

export default router;
