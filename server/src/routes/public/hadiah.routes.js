import express from 'express';
import * as publicHadiahController from '../../controllers/public/hadiah.controller.js';

const router = express.Router();

router.get('/', publicHadiahController.getPublicHadiahs);

export default router;
