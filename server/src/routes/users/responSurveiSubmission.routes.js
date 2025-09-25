import express from 'express';
import * as responSurveiSubmissionController from '../../controllers/users/responSurveiSubmission.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { saveDraftSchema } from '../../validations/users/responSurveiSubmission.validation.js';

const router = express.Router({ mergeParams: true });

router.get('/draft', authenticate, authorize('umum'), responSurveiSubmissionController.getDraft);
router.patch('/draft', authenticate, authorize('umum'), validate(saveDraftSchema), responSurveiSubmissionController.updateDraft);
router.post('/submit', authenticate, authorize('umum'), responSurveiSubmissionController.submitRespons);

export default router;
