import { api } from '@/lib/api';
import {
  SurveyPayment,
  SurveyPaymentListResponse,
} from '../types/types';

export const surveyPaymentService = {
  getAll: async (params?: Record<string, any>): Promise<SurveyPaymentListResponse> => {
    const response = await api.get('/api/users/pembayaran-survei', { params });
    return response.data;
  },

  getById: async (id: string): Promise<SurveyPayment> => {
    const response = await api.get(`/api/users/pembayaran-survei/${id}`);
    return response.data.data;
  },

  create: async (id: string): Promise<SurveyPayment> => {
    const response = await api.post(`/api/users/pembayaran-survei/${id}`);
    return response.data.data;
  },
};
