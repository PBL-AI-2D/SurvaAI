import * as surveiService from '../../services/survei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getUserSurveis = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const result = await surveiService.index({
      ...req.query,
      id_umum: umumId
    });
    const message = result.data.length > 0
      ? 'Survei retrieved successfully'
      : 'No survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createUserSurvei = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const surveiData = {
      ...req.body,
      id_umum: umumId
    };
    const newSurvei = await surveiService.create(surveiData);
    resSuccess(res, 'Survei created successfully', newSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getUserSurvei = async (req, res) => {
  try {
    const survei = await surveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    resSuccess(res, 'Survei detail retrieved successfully', survei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateUserSurvei = async (req, res) => {
  try {
    const survei = await surveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    const updatedSurvei = await surveiService.update(req.params.id, req.body);
    resSuccess(res, 'Survei updated successfully', updatedSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deleteUserSurvei = async (req, res) => {
  try {
    const survei = await surveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    await surveiService.destroy(req.params.id);
    resSuccess(res, 'Survei deleted successfully');
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
