import * as konfigurasiHargaService from '../services/konfigurasiHarga.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getConfig = async (req, res) => {
  try {
    const config = await konfigurasiHargaService.index();
    resSuccess(res, 'Konfigurasi harga retrieved successfully', config);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createConfig = async (req, res) => {
  try {
    const newConfig = await konfigurasiHargaService.create(req.body);
    resSuccess(res, 'Konfigurasi created successfully', newConfig, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateConfig = async (req, res) => {
  try {
    const updatedConfig = await konfigurasiHargaService.update(req.body);
    resSuccess(res, 'Konfigurasi harga updated successfully', updatedConfig);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
