import { verifyAccessToken } from '../../utils/jwt.js';
import * as registerService from '../../services/auth/register.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';

export const emailRegister = async (req, res) => {
  try {
    const result = await registerService.emailVerification(req.body.email);
    resSuccess(res, 'OTP has been sent to your email', result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const result = await registerService.validationOTP(req.body.email, req.body.otp);
    resSuccess(res, 'OTP verified successfully', { register_token: result });
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const completeAccount = async (req, res) => {
  try {
    const { register_token: registerToken, ...accountData } = req.body;
    if (!registerToken) throw new Error("Unauthorized request");

    const payload = verifyAccessToken(registerToken);
    if (payload.type !== 'register') throw { status: 403, message: 'Invalid register token' };

    const result = await registerService.completeRegistration({
      ...accountData,
      id: payload.userId
    });

    resSuccess(res, 'Account registered successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};
