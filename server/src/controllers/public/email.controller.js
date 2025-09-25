import { sendOpinionEmail } from '../../services/email.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';

export const emailOpinion = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const result = await sendOpinionEmail({ email, subject, message });
    resSuccess(res, 'Opinion email has been sent successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
