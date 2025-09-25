import * as loginService from '../../services/auth/login.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';

export const login = async (req, res) => {
  const { email, password, remember_me } = req.body;
  try {
    const { accessToken, refreshToken } = await loginService.userLogin(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      ...(remember_me && { maxAge: 30 * 24 * 60 * 60 * 1000 })
    });

    resSuccess(res, 'Logged in successfully', { accessToken });
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const refresh = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await loginService.userRefresh(req.cookies?.refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    resSuccess(res, 'Token refreshed successfully', { accessToken });
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const logout = async (req, res) => {
  try {
    await loginService.userLogout(req.cookies?.refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    resSuccess(res, 'Logged out successfully');
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};