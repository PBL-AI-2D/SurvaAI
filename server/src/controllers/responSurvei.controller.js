import * as responSurveiService from '../services/responSurvei.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getResponSurveis = async (req, res) => {
  try {
    const result = await responSurveiService.index(req.params.surveiId, req.query);
    const message = result.data.length > 0
      ? 'Respon survei retrieved successfully'
      : 'No respon survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getAllResponSurvei = async (req, res) => {
  try {
    const result = await responSurveiService.indexAll(req.query);
    const message = result.data.length > 0
      ? 'Respon survei retrieved successfully'
      : 'No respon survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getResponSurvei = async (req, res) => {
  try {
    const responSurvei = await responSurveiService.show(req.params.id);
    resSuccess(res, 'Respon survei details retrieved successfully', responSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deleteResponSurvei = async (req, res) => {
  try {
    await responSurveiService.destroy(req.params.id);
    resSuccess(res, 'Respon survei deleted successfully', null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
