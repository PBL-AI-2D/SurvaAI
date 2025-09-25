import express from 'express';
import * as penggunaController from '../controllers/pengguna.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createPenggunaSchema, updatePenggunaSchema } from '../validations/pengguna.validation.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), penggunaController.getPenggunas);
router.get('/:id', authenticate, authorize('admin'), penggunaController.getPengguna);
router.post('/', authenticate, authorize('admin'), validate(createPenggunaSchema), penggunaController.createPengguna);
router.patch('/:id', authenticate, authorize('admin'), validate(updatePenggunaSchema), penggunaController.updatePengguna);
router.delete('/:id', authenticate, authorize('admin'), penggunaController.deletePengguna);

export default router;
