import express from 'express';
import * as surveiController from '../controllers/survei.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createSurveiSchema, updateSurveiSchema } from '../validations/survei.validation.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), surveiController.getSurveis);
router.get('/:id', authenticate, authorize('admin'), surveiController.getSurvei);
router.post('/', authenticate, authorize('admin'), validate(createSurveiSchema), surveiController.createSurvei);
router.patch('/:id', authenticate, authorize('admin'), validate(updateSurveiSchema), surveiController.updateSurvei);
router.delete('/:id', authenticate, authorize('admin'), surveiController.deleteSurvei);

export default router;
