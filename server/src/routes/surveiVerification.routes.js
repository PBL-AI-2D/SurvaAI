import express from 'express';
import * as surveiVerificationController from '../controllers/surveiVerification.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { verifySurveiByAdminSchema } from '../validations/surveiVerification.validation.js';

const router = express.Router();

router.post('/submit-verifikasi/:id', authenticate, authorize('admin'), surveiVerificationController.submitSurveiForVerification);
router.post('/verifikasi/:id', authenticate, authorize('admin'), validate(verifySurveiByAdminSchema), surveiVerificationController.verifySurveiByAdmin);

export default router;
