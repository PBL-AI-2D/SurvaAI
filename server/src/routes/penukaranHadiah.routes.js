import express from 'express';
import * as penukaranHadiahRoutes from '../controllers/penukaranHadiah.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createPenukaranHadiahSchema } from '../validations/penukaranHadiah.validation.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), penukaranHadiahRoutes.getPenukaranHadiahs);
router.get('/:id', authenticate, authorize('admin'), penukaranHadiahRoutes.getPenukaranHadiah);
router.post('/', authenticate, authorize('admin'), validate(createPenukaranHadiahSchema), penukaranHadiahRoutes.createPenukaranHadiah);
router.delete('/:id', authenticate, authorize('admin'), penukaranHadiahRoutes.deletePenukaranHadiah);

export default router;
