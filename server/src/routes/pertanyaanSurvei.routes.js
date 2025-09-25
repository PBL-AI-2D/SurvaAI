import express from 'express';
import * as pertanyaanSurveiController from '../controllers/pertanyaanSurvei.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createPertanyaanSurveiSchema, updatePertanyaanSurveiSchema } from '../validations/pertanyaanSurvei.validation.js';

const router = express.Router({ mergeParams: true });

router.get('/survei/:surveiId/pertanyaan-survei', authenticate, authorize('admin'), pertanyaanSurveiController.getpertanyaanSurveis);
router.post('/survei/:surveiId/pertanyaan-survei', authenticate, authorize('admin'), validate(createPertanyaanSurveiSchema), pertanyaanSurveiController.createPertanyaanSurvei);
router.get('/pertanyaan-survei/:id', authenticate, authorize('admin'), pertanyaanSurveiController.getPertanyaanSurvei);
router.patch('/pertanyaan-survei/:id', authenticate, authorize('admin'), validate(updatePertanyaanSurveiSchema), pertanyaanSurveiController.updatePertanyaanSurvei);
router.delete('/pertanyaan-survei/:id', authenticate, authorize('admin'), pertanyaanSurveiController.deletePertanyaanSurvei);

export default router;
