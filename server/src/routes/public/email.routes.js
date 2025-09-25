import express from 'express';
import * as emailController from '../../controllers/public/email.controller.js';
import { validate } from '../../middlewares/validate.js';
import { sendOpinionEmailSchema } from '../../validations/email.validation.js';

const router = express.Router();

router.post('/opinion', validate(sendOpinionEmailSchema), emailController.emailOpinion);

export default router;
