import express from 'express';
import * as profileController from '../../controllers/users/profile.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateProfileSchema } from '../../validations/users/profile.validation.js';

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);
router.patch('/', authenticate, validate(updateProfileSchema), profileController.updateProfile);

export default router;
