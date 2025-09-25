import { Router } from 'express';
import loginRoutes from './auth/login.routes.js';
import registerRoutes from './auth/register.routes.js';
import penggunaRoutes from './pengguna.routes.js';
import surveiRoutes from './survei.routes.js';
import pertanyaanSurveiRoutes from './pertanyaanSurvei.routes.js';
import pembayaranSurveiRoutes from './pembayaranSurvei.routes.js';
import responSurveiRoutes from './responSurvei.routes.js';
import surveiVerificationRoutes from './surveiVerification.routes.js';
import responSurveiSubmissionRoutes from './users/responSurveiSubmission.routes.js';
import konfigurasiHargaRoutes from './konfigurasiHarga.routes.js';
import hadiahRoutes from './hadiah.routes.js';
import penukaranHadiahRoutes from './penukaranHadiah.routes.js';

import profileRoutes from './users/profile.routes.js';
import userSurveiRoutes from './users/survei.routes.js';
import userPertanyaanSurveiRoutes from './users/pertanyaanSurvei.routes.js';
import userPembayaranSurveiRoutes from './users/pembayaranSurvei.routes.js';
import userResponSurveiRoutes from './users/responSurvei.routes.js';
import usersurveiVerificationRoutes from './users/surveiVerification.routes.js';
import userResponSurveiResultRoutes from './users/responSurveiResult.routes.js';
import userPenukaranHadiahRoutes from './users/penukaranHadiah.routes.js';

import publicSurveiRoutes from './public/survei.routes.js';
import publicHadiahRoutes from './public/hadiah.routes.js';
import publicEmailRoutes from './public/email.routes.js';

const router = Router();

router.use('/', loginRoutes);
router.use('/register', registerRoutes);
router.use('/pengguna', penggunaRoutes);
router.use('/survei', surveiRoutes);
router.use('/', pertanyaanSurveiRoutes);
router.use('/pembayaran-survei', pembayaranSurveiRoutes);
router.use('/', responSurveiRoutes);
router.use('/survei', surveiVerificationRoutes);
router.use('/survei/:surveiId/respon-survei', responSurveiSubmissionRoutes);
router.use('/konfigurasi-harga', konfigurasiHargaRoutes);
router.use('/hadiah', hadiahRoutes);
router.use('/penukaran-hadiah', penukaranHadiahRoutes);

router.use('/users/profile', profileRoutes)
router.use('/users/survei', userSurveiRoutes)
router.use('/users', userPertanyaanSurveiRoutes)
router.use('/users/pembayaran-survei', userPembayaranSurveiRoutes)
router.use('/users/respon-survei', userResponSurveiRoutes)
router.use('/users/survei', usersurveiVerificationRoutes)
router.use('/users/survei', userResponSurveiResultRoutes)
router.use('/users/penukaran-hadiah', userPenukaranHadiahRoutes)

router.use('/public/survei', publicSurveiRoutes)
router.use('/public/hadiah', publicHadiahRoutes)
router.use('/public/email', publicEmailRoutes)

export default router;
