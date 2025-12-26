import { Router } from 'express';
import * as datasetAiController from '../controllers/datasetAi.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload dataset (CSV/Excel)
router.post(
  '/upload',
  authorize('umum', 'admin'),
  datasetAiController.uploadMiddleware,
  datasetAiController.uploadDataset
);

// Get all datasets
router.get(
  '/',
  authorize('umum', 'admin'),
  datasetAiController.getAllDatasets
);

// Get dataset by ID
router.get(
  '/:id',
  authorize('umum', 'admin'),
  datasetAiController.getDatasetById
);

// Get dataset versions
router.get(
  '/versions/:namaDataset',
  authorize('umum', 'admin'),
  datasetAiController.getDatasetVersions
);

// Get dataset preview
router.get(
  '/:id/preview',
  authorize('umum', 'admin'),
  datasetAiController.getDatasetPreview
);

// Delete dataset
router.delete(
  '/:id',
  authorize('umum', 'admin'),
  datasetAiController.deleteDataset
);

export default router;

