import express from 'express';
import * as publicSurveiController from '../../controllers/public/survei.controller.js';

const router = express.Router();

router.get('/', publicSurveiController.getPublishedSurveis);
router.get('/:id', publicSurveiController.getPublishedSurvei);

export default router;
