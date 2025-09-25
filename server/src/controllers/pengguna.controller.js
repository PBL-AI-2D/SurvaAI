import * as penggunaService from '../services/pengguna.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getPenggunas = async (req, res) => {
  try {
    const result = await penggunaService.index(req.query);
    const message = result.data.length > 0
      ? 'Penggunas retrieved successfully'
      : 'No penggunas found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createPengguna = async (req, res) => {
  try {
    const newPengguna = await penggunaService.create(req.body);
    resSuccess(res, 'Pengguna created successfully', newPengguna, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getPengguna = async (req, res) => {
  try {
    const pengguna = await penggunaService.show(req.params.id);
    resSuccess(res, `Detail pengguna ID ${req.params.id} retrieved`, pengguna);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updatePengguna = async (req, res) => {
  try {
    const updated = await penggunaService.update(req.params.id, req.body);
    resSuccess(res, `Pengguna ID ${req.params.id} updated successfully`, updated);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deletePengguna = async (req, res) => {
  try {
    await penggunaService.destroy(req.params.id);
    resSuccess(res, `Pengguna ID ${req.params.id} deleted successfully`, null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
