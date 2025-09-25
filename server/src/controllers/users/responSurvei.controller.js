import * as responSurveiService from '../../services/responSurvei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getUserResponSurveis = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);

    const result = await responSurveiService.index(null, {
      ...req.query,
      id_umum: umumId
    });
    const message = result.data.length > 0
      ? 'Respon survei retrieved successfully'
      : 'No respon survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getUserResponSurvei = async (req, res) => {
  try {
    const responSurvei = await responSurveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (responSurvei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this respon survei', 403);
    }

    resSuccess(res, 'Respon survei details retrieved successfully', responSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deleteUserResponSurvei = async (req, res) => {
  try {
    const responSurvei = await responSurveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (responSurvei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this respon survei', 403);
    }

    if (responSurvei.is_completed) {
      return resFail(res, 'Completed respon survei cannot be deleted', 400);
    }

    await responSurveiService.destroy(req.params.id);
    resSuccess(res, 'Respon survei deleted successfully', null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
