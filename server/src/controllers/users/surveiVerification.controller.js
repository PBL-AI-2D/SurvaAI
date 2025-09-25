import * as surveiVerificationService from '../../services/surveiVerification.service.js';
import * as surveiService from '../../services/survei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const submitUserSurveiForVerification = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.id);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }
  
    const updatedSurvei = await surveiVerificationService.submitForVerification(req.params.id);
    resSuccess(res, 'Survei submitted for verification successfully.', updatedSurvei, 200);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
