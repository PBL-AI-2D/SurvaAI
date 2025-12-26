import { Router } from 'express';
import * as adminControlController from '../controllers/adminControl.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Trigger manual analysis
router.post(
  '/survey/:surveiId/trigger-analysis',
  authorize('umum', 'admin'),
  adminControlController.triggerManualAnalysis
);

// Reset analysis
router.post(
  '/survey/:surveiId/reset-analysis',
  authorize('umum', 'admin'),
  adminControlController.resetAnalysis
);

// Get threshold configuration
router.get(
  '/threshold-config',
  authorize('umum', 'admin'),
  adminControlController.getThresholdConfig
);

// Update threshold configuration (admin only)
router.put(
  '/threshold-config',
  authorize('admin'),
  adminControlController.updateThresholdConfig
);

// Clear cache (admin only)
router.delete(
  '/cache',
  authorize('admin'),
  adminControlController.clearCache
);

// Get system status (admin only)
router.get(
  '/system-status',
  authorize('admin'),
  adminControlController.getSystemStatus
);

export default router;

