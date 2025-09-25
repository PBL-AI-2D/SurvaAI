import * as pembayaranSurveiService from '../services/pembayaranSurvei.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getPembayaranSurveis = async (req, res) => {
  try {
    const result = await pembayaranSurveiService.index(req.query)
    const message = result.data.length > 0
      ? 'Pembayaran survei retrieved successfully'
      : 'No pembayaran survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getPembayaranSurvei = async (req, res) => {
  try {
    const pembayaranSurvei = await pembayaranSurveiService.show(req.params.id);
    resSuccess(res, 'Pembayaran survei detail retrieved successfully', pembayaranSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deletePembayaranSurvei = async (req, res) => {
  try {
    await pembayaranSurveiService.destroy(req.params.id);
    resSuccess(res, `Pembayaran survei deleted successfully`, null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
