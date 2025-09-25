import * as pertanyaanSurveiService from '../services/pertanyaanSurvei.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getpertanyaanSurveis = async (req, res) => {
  try {
    const result = await pertanyaanSurveiService.index(req.params.surveiId, req.query);
    const message = result.data.length > 0
      ? 'Pertanyaan surveis retrieved successfully'
      : 'No pertanyaan survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createPertanyaanSurvei = async (req, res) => {
  try {
    const newPertanyaanSurvei = await pertanyaanSurveiService.create({
      ...req.body,
      id_survei: req.params.surveiId
    });
    resSuccess(res, 'Pertanyaan survei created successfully', newPertanyaanSurvei, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getPertanyaanSurvei = async (req, res) => {
  try {
    const pertanyaanSurvei = await pertanyaanSurveiService.show(req.params.id);
    resSuccess(res, `Pertanyaan survei details for ID ${req.params.id} retrieved successfully`, pertanyaanSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updatePertanyaanSurvei = async (req, res) => {
  try {
    const updatedPertanyaanSurvei = await pertanyaanSurveiService.update(req.params.id, req.body);
    resSuccess(res, `Pertanyaan survei with ID ${req.params.id} updated successfully`, updatedPertanyaanSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deletePertanyaanSurvei = async (req, res) => {
  try {
    await pertanyaanSurveiService.destroy(req.params.id);
    resSuccess(res, `Pertanyaan survei with ID ${req.params.id} deleted successfully`, null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
