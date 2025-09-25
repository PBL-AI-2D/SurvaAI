import express from 'express';
import * as surveiVerificationController from '../../controllers/users/surveiVerification.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/submit-verifikasi/:id', authenticate, authorize('umum'), surveiVerificationController.submitUserSurveiForVerification);

export default router;
