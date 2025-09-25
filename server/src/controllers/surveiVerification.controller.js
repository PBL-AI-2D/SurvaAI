import * as surveiVerificationService from '../services/surveiVerification.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

export const submitSurveiForVerification = async (req, res) => {
  try {
    const updatedSurvei = await surveiVerificationService.submitForVerification(req.params.id);
    resSuccess(res, 'Survei submitted for verification successfully.', updatedSurvei, 200);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const verifySurveiByAdmin = async (req, res) => {
  try {
    const { approve } = req.body; 
    const updatedSurvei = await surveiVerificationService.verifySurvei(req.params.id, req.body); 
    const message = approve ? 'Survei approved successfully.' : 'Survei rejected successfully.';
    resSuccess(res, message, updatedSurvei, 200);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
