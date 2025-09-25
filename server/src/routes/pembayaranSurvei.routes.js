import express from 'express';
import * as pembayaranSurveiController from '../controllers/pembayaranSurvei.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), pembayaranSurveiController.getPembayaranSurveis);
router.get('/:id', authenticate, authorize('admin'), pembayaranSurveiController.getPembayaranSurvei);
router.delete('/:id', authenticate, authorize('admin'), pembayaranSurveiController.deletePembayaranSurvei);

export default router;
