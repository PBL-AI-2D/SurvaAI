import express from 'express';
import * as loginController from '../../controllers/auth/login.controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginValidation } from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/login', validate(loginValidation), loginController.login);
router.post('/refresh', loginController.refresh);
router.post('/logout', loginController.logout);

export default router;
