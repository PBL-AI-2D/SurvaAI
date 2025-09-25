import express from 'express';
import * as responSurveiController from '../../controllers/users/responSurvei.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, authorize('umum'), responSurveiController.getUserResponSurveis);
router.get('/:id', authenticate, authorize('umum'), responSurveiController.getUserResponSurvei);
router.delete('/:id', authenticate, authorize('umum'), responSurveiController.deleteUserResponSurvei);

export default router;
