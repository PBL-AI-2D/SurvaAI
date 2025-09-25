import * as surveiService from '../services/survei.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getSurveis = async (req, res) => {
  try {
    const result = await surveiService.index(req.query);
    const message = result.data.length > 0
      ? 'Surveis retrieved successfully'
      : 'No survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createSurvei = async (req, res) => {
  try {
    const newSurvei = await surveiService.create(req.body);
    resSuccess(res, 'Survei created successfully', newSurvei, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getSurvei = async (req, res) => {
  try {
    const survei = await surveiService.show(req.params.id);
    resSuccess(res, `Survei details for ID ${req.params.id} retrieved successfully`, survei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateSurvei = async (req, res) => {
  try {
    const updatedSurvei = await surveiService.update(req.params.id, req.body);
    resSuccess(res, `Survei with ID ${req.params.id} updated successfully`, updatedSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deleteSurvei = async (req, res) => {
  try {
    await surveiService.destroy(req.params.id);
    resSuccess(res, `Survei with ID ${req.params.id} deleted successfully`, null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
