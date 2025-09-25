import * as hadiahService from '../services/hadiah.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const getHadiahs = async (req, res) => {
  try {
    const result = await hadiahService.index(req.query);
    const message = result.data.length > 0
      ? 'Hadiahs retrieved successfully'
      : 'No hadiahs found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createHadiah = async (req, res) => {
  try {
    const newHadiah = await hadiahService.create(req.body);
    resSuccess(res, 'Hadiah created successfully', newHadiah, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getHadiah = async (req, res) => {
  try {
    const hadiah = await hadiahService.show(req.params.id);
    resSuccess(res, `Hadiah details for ID ${req.params.id} retrieved successfully`, hadiah);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateHadiah = async (req, res) => {
  try {
    const updatedHadiah = await hadiahService.update(req.params.id, req.body);
    resSuccess(res, `Hadiah with ID ${req.params.id} updated successfully`, updatedHadiah);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deleteHadiah = async (req, res) => {
  try {
    await hadiahService.destroy(req.params.id);
    resSuccess(res, `Hadiah with ID ${req.params.id} deleted successfully`, null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
