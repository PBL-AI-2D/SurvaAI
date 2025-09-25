import { api } from '@/lib/api';
import {
  EmailRegisterPayload,
  VerifyOtpPayload,
  CompleteAccountPayload,
  LoginPayload,
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
} from '../types/types';

export const authService = {
  emailRegister: async (payload: EmailRegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('api/register', payload);
    return response.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('api/register/verify', payload);
    return response.data;
  },

  completeAccount: async (payload: CompleteAccountPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('api/register/account', payload);
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/login', payload);
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/api/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/logout');
  },
};
