import { Op } from 'sequelize';
import * as surveiService from '../../services/survei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';

export const getPublishedSurveis = async (req, res) => {
  try {
    const result = await surveiService.index({
      ...req.query,
      status: 'published',
      tanggal_mulai: { [Op.lte]: new Date() },
      tanggal_berakhir: { [Op.gte]: new Date() }
    });
    const message = result.data.length > 0
      ? 'Published survei retrieved successfully'
      : 'No published survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getPublishedSurvei = async (req, res) => {
  try {
    const survei = await surveiService.show(req.params.id);
    resSuccess(res, `Survei details for ID ${req.params.id} retrieved successfully`, survei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
