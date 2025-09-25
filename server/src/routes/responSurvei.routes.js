import express from 'express';
import * as responSurveiController from '../controllers/responSurvei.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/survei/:surveiId/respon-survei', authenticate, authorize('admin'), responSurveiController.getResponSurveis);
router.get('/respon-survei', authenticate, authorize('admin'), responSurveiController.getAllResponSurvei);
router.get('/respon-survei/:id', authenticate, authorize('admin'), responSurveiController.getResponSurvei);
router.delete('/respon-survei/:id', authenticate, authorize('admin'), responSurveiController.deleteResponSurvei);

export default router;
