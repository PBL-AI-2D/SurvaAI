import express from 'express';
import * as pembayaranSurveiController from '../../controllers/users/pembayaranSurvei.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('umum'), pembayaranSurveiController.getUserPembayaranSurveis);
router.get('/:id', authenticate, authorize('umum'), pembayaranSurveiController.getUserPembayaranSurvei);
router.post('/:id', authenticate, authorize('umum'), pembayaranSurveiController.createPayment);
router.post('/webhook/xendit', pembayaranSurveiController.webhookHandler);

export default router;
