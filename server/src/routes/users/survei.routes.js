import express from 'express';
import * as userSurveiController from '../../controllers/users/survei.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createUserSurveiSchema, updateUserSurveiSchema } from '../../validations/users/survei.validation.js';

const router = express.Router();

router.get('/', authenticate, authorize('umum'), userSurveiController.getUserSurveis);
router.get('/:id', authenticate, authorize('umum'), userSurveiController.getUserSurvei);
router.post('/', authenticate, authorize('umum'), validate(createUserSurveiSchema), userSurveiController.createUserSurvei);
router.patch('/:id', authenticate, authorize('umum'), validate(updateUserSurveiSchema), userSurveiController.updateUserSurvei);
router.delete('/:id', authenticate, authorize('umum'), userSurveiController.deleteUserSurvei);

export default router;
