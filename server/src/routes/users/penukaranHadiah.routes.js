import express from 'express';
import * as userPenukaranHadiahController from '../../controllers/users/penukaranHadiah.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createPenukaranHadiahSchema } from '../../validations/users/penukaranHadiah.validation.js';

const router = express.Router();

router.get('/', authenticate, authorize('umum'), userPenukaranHadiahController.getUserPenukaranHadiahs);
router.get('/:id', authenticate, authorize('umum'), userPenukaranHadiahController.getUserPenukaranHadiah);
router.post('/', authenticate, authorize('umum'), validate(createPenukaranHadiahSchema), userPenukaranHadiahController.createUserPenukaranHadiah);

export default router;
