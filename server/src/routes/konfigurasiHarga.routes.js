import express from 'express';
import * as konfigurasiHargaController from '../controllers/konfigurasiHarga.controller.js';
import { validate } from '../middlewares/validate.js';
import { createKonfigurasiHargaSchema, updateKonfigurasiHargaSchema } from '../validations/konfigurasiHarga.validation.js';

const router = express.Router();

router.get('/', konfigurasiHargaController.getConfig);
router.post('/', validate(createKonfigurasiHargaSchema), konfigurasiHargaController.createConfig);
router.patch('/', validate(updateKonfigurasiHargaSchema), konfigurasiHargaController.updateConfig);

export default router;
