import * as pertanyaanSurveiService from '../../services/pertanyaanSurvei.service.js';
import * as surveiService from '../../services/survei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getUserPertanyaanSurveis = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.surveiId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized access to this pertanyaan surveis', 403);
    }

    const result = await pertanyaanSurveiService.index(req.params.surveiId, req.query);
    const message = result.data.length > 0
      ? 'Pertanyaan survei retrieved successfully'
      : 'No pertanyaan survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const createUserPertanyaanSurvei = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.surveiId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized access to this pertanyaan surveis', 403);
    }
    const pertanyaanSurveiData = {
      ...req.body,
      id_survei: req.params.surveiId,
      id_umum: umumId
    };
    const newPertanyaanSurvei = await pertanyaanSurveiService.create(pertanyaanSurveiData);
    resSuccess(res, 'Pertanyaan survei created successfully', newPertanyaanSurvei, 201);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getUserPertanyaanSurvei = async (req, res) => {
  try {
    const pertanyaanSurvei = await pertanyaanSurveiService.show(req.params.id);
    const survei = await surveiService.show(pertanyaanSurvei.id_survei);
    const umumId = await getUmumIdByUserId(req.user.userId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized access to this pertanyaan survei', 403);
    }

    resSuccess(res, 'Pertanyaan survei details retrieved successfully', pertanyaanSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateUserPertanyaanSurvei = async (req, res) => {
  try {
    const pertanyaanSurvei = await pertanyaanSurveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(pertanyaanSurvei.id_survei);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized access to this pertanyaan survei', 403);
    }

    const updatedPertanyaanSurvei = await pertanyaanSurveiService.update(req.params.id, req.body);
    resSuccess(res, 'Pertanyaan survei updated successfully', updatedPertanyaanSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateUserTipeVisualisasiPertanyaanSurvei = async (req, res) => {
  try {
    const pertanyaanSurvei = await pertanyaanSurveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(pertanyaanSurvei.id_survei);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized access to this pertanyaan survei', 403);
    }

    const updatedPertanyaanSurvei = await pertanyaanSurveiService.update(
      req.params.id,
      { tipe_visualisasi: req.body.tipe_visualisasi },
      { skipStatusValidation: true }
    );
    resSuccess(res, 'Tipe visualisasi pertanyaan survei updated successfully', updatedPertanyaanSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const deleteUserPertanyaanSurvei = async (req, res) => {
  try {
    const pertanyaanSurvei = await pertanyaanSurveiService.show(req.params.id);
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(pertanyaanSurvei.id_survei);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized access to this pertanyaan survei', 403);
    }

    await pertanyaanSurveiService.destroy(req.params.id);
    resSuccess(res, 'Pertanyaan survei deleted successfully', null);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
