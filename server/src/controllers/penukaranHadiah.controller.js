import * as penukaranHadiahService from '../services/penukaranHadiah.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getPenukaranHadiahs = async (req, res) => {
  try {
    const result = await penukaranHadiahService.index(req.query);
    const message = result.data.length > 0
      ? 'Penukaran hadiahs retrieved successfully'
      : 'No penukaran hadiahs found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createPenukaranHadiah = async (req, res) => {
  try {
    const newPenukaranHadiah = await penukaranHadiahService.create(req.body);
    resSuccess(res, 'Penukaran hadiah created successfully', newPenukaranHadiah, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getPenukaranHadiah = async (req, res) => {
  try {
    const penukaranHadiah = await penukaranHadiahService.show(req.params.id);
    resSuccess(res, 'Penukaran hadiah details retrieved successfully', penukaranHadiah);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deletePenukaranHadiah = async (req, res) => {
  try {
    await penukaranHadiahService.destroy(req.params.id);
    resSuccess(res, `Penukaran hadiah deleted successfully`, null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
