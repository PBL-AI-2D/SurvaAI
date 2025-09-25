import * as responSurveiSubmissionService from '../../services/responSurveiSubmission.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getDraft = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const [responSurvei] = await responSurveiSubmissionService.getOrCreateDraft(
      req.params.surveiId,
      umumId
    );
    resSuccess(res, 'Draft respon survei retrieved successfully', {
      draft: responSurvei.respon,
      is_completed: responSurvei.is_completed
    });
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const updateDraft = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const { respon } = req.body;
    const result = await responSurveiSubmissionService.saveDraftResponse(
      req.params.surveiId,
      umumId,
      respon
    );
    resSuccess(res, 'Draft respon survei saved successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const submitRespons = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const result = await responSurveiSubmissionService.submitFinalResponse(
      req.params.surveiId,
      umumId
    );
    resSuccess(res, 'Respon survei submitted successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
