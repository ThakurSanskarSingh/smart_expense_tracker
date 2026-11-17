/**
 * @fileoverview User profile routing declarations.
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/me', authController.getProfile);
router.put('/me', validate(updateProfileSchema), authController.updateProfile);

export default router;
