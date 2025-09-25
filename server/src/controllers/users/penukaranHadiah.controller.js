import * as penukaranHadiahService from '../../services/penukaranHadiah.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getUserPenukaranHadiahs = async (req, res) => {
	try {
		const umumId = await getUmumIdByUserId(req.user.userId);
		const result = await penukaranHadiahService.index({
			...req.query,
			id_umum: umumId
		});
		const message = result.data.length > 0
			? 'Penukaran hadiahs retrieved successfully'
			: 'No penukaran hadiahs found';
		resSuccess(res, message, result);
	} catch (error) {
		resFail(res, error.message, error.status);
	}
};

export const createUserPenukaranHadiah = async (req, res) => {
	try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const penukaranHadiahData = {
      ...req.body,
      id_umum: umumId
    };
		const newPenukaranHadiah = await penukaranHadiahService.create(penukaranHadiahData);
		resSuccess(res, 'Penukaran hadiah created successfully', newPenukaranHadiah, 201);
	} catch (error) {
		resFail(res, error.message, error.status);
	}
};

export const getUserPenukaranHadiah = async (req, res) => {
	try {
    const umumId = await getUmumIdByUserId(req.user.userId);
		const penukaranHadiah = await penukaranHadiahService.show(req.params.id);
		if (penukaranHadiah.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this penukaran hadiah', 403);
    }

		resSuccess(res, 'Penukaran hadiah details retrieved successfully', penukaranHadiah);
	} catch (error) {
		resFail(res, error.message, error.status);
	}
};
