import * as pembayaranSurveiService from '../../services/pembayaranSurvei.service.js';
import * as surveiService from '../../services/survei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getUserPembayaranSurveis = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const result = await pembayaranSurveiService.index({
      ...req.query,
      id_umum: umumId
    });
    const message = result.data.length > 0
      ? 'Pembayaran survei retrieved successfully'
      : 'No pembayaran survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createPayment = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.id);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    const newPembayaanSurvei = await pembayaranSurveiService.create(
      req.params.id,
      umumId
    );
    resSuccess(res, 'Payment initiated', newPembayaanSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const webhookHandler = async (req, res) => {
  try {
    await pembayaranSurveiService.webhook(req.headers, req.body);
    resSuccess(res, 'Webhook processed', null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getUserPembayaranSurvei = async (req, res) => {
  try {
    const pembayaranSurvei = await pembayaranSurveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (pembayaranSurvei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this pembayaran survei', 403);
    }

    resSuccess(res, 'Pembayaran survei detail retrieved successfully', pembayaranSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
