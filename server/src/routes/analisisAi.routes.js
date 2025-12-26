import { Router } from 'express';
import * as analisisAiController from '../controllers/analisisAi.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get analysis by ID
router.get(
  '/:id',
  authorize('umum', 'admin'),
  analisisAiController.getAnalysisById
);

// Get analysis status for survey
router.get(
  '/survey/:surveiId/status',
  authorize('umum', 'admin'),
  analisisAiController.getAnalysisStatus
);

// Get all analyses for survey
router.get(
  '/survey/:surveiId',
  authorize('umum', 'admin'),
  analisisAiController.getAnalysesBySurvey
);

// Update analysis status (for manual trigger)
router.patch(
  '/:id/status',
  authorize('umum', 'admin'),
  analisisAiController.updateAnalysisStatus
);

export default router;

