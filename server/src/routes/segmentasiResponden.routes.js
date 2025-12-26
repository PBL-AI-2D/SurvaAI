import { Router } from 'express';
import * as segmentasiRespondenController from '../controllers/segmentasiResponden.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all segments for survey
router.get(
  '/survey/:surveiId',
  authorize('umum', 'admin'),
  segmentasiRespondenController.getSegmentsBySurvey
);

// Get segment by ID
router.get(
  '/:id',
  authorize('umum', 'admin'),
  segmentasiRespondenController.getSegmentById
);

// Get segment details with respondents
router.get(
  '/:id/details',
  authorize('umum', 'admin'),
  segmentasiRespondenController.getSegmentDetails
);

// Compare segments
router.post(
  '/compare',
  authorize('umum', 'admin'),
  segmentasiRespondenController.compareSegments
);

// Get segment history
router.get(
  '/survey/:surveiId/history',
  authorize('umum', 'admin'),
  segmentasiRespondenController.getSegmentHistory
);

export default router;

