import express from 'express';
import * as registerController from '../../controllers/auth/register.controller.js';
import { validate } from '../../middlewares/validate.js';
import { emailRegisterValidation, verifyOTPValidation, completeAccountValidation } from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/', validate(emailRegisterValidation), registerController.emailRegister);
router.post('/verify', validate(verifyOTPValidation), registerController.verifyOTP);
router.post('/account', validate(completeAccountValidation), registerController.completeAccount);

export default router;
