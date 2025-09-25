import express from 'express';
import * as hadiahController from '../controllers/hadiah.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createHadiahSchema, updateHadiahSchema } from '../validations/hadiah.validation.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), hadiahController.getHadiahs);
router.get('/:id', authenticate, authorize('admin'), hadiahController.getHadiah);
router.post('/', authenticate, authorize('admin'), validate(createHadiahSchema), hadiahController.createHadiah);
router.patch('/:id', authenticate, authorize('admin'), validate(updateHadiahSchema), hadiahController.updateHadiah);
router.delete('/:id', authenticate, authorize('admin'), hadiahController.deleteHadiah);

export default router;