import express from 'express';
import * as userPertanyaanSurveiController from '../../controllers/users/pertanyaanSurvei.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createPertanyaanSurveiSchema, updatePertanyaanSurveiSchema, updateTipeVisualisasiSchema } from '../../validations/users/pertanyaanSurvei.validation.js';

const router = express.Router({ mergeParams: true });

router.get('/survei/:surveiId/pertanyaan-survei', authenticate, authorize('umum'), userPertanyaanSurveiController.getUserPertanyaanSurveis);
router.post('/survei/:surveiId/pertanyaan-survei', authenticate, authorize('umum'), validate(createPertanyaanSurveiSchema), userPertanyaanSurveiController.createUserPertanyaanSurvei);
router.get('/pertanyaan-survei/:id', authenticate, authorize('umum'), userPertanyaanSurveiController.getUserPertanyaanSurvei);
router.patch('/pertanyaan-survei/:id', authenticate, authorize('umum'), validate(updatePertanyaanSurveiSchema), userPertanyaanSurveiController.updateUserPertanyaanSurvei);
router.patch('/pertanyaan-survei/:id/tipe-visualisasi', authenticate, authorize('umum'), validate(updateTipeVisualisasiSchema), userPertanyaanSurveiController.updateUserTipeVisualisasiPertanyaanSurvei);
router.delete('/pertanyaan-survei/:id', authenticate, authorize('umum'), userPertanyaanSurveiController.deleteUserPertanyaanSurvei);

export default router;
