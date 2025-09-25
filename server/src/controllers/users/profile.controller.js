import * as penggunaService from '../../services/pengguna.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await penggunaService.show(req.user.userId);
    resSuccess(res, 'Profile retrieved successfully', profile);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateProfile = await penggunaService.update(req.user.userId, req.body);
    resSuccess(res, 'Profile updated successfully', updateProfile);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
