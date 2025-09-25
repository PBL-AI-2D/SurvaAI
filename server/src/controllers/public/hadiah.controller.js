import { Op } from 'sequelize';
import * as hadiahService from '../../services/hadiah.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';

export const getPublicHadiahs = async (req, res) => {
  try {
    const result = await hadiahService.index({
      ...req.query,
      stok: { [Op.gt]: 0 }
    });
    const message = result.data.length > 0
      ? 'Hadiahs retrieved successfully'
      : 'No hadiahs found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
