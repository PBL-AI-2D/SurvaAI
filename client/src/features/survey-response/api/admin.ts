import api from '@/lib/api';
import { ResponSurveiResponse } from '../types/types';

export const adminSurveyResponseService = {
  getAllItems: async (params?: Record<string, any>): Promise<ResponSurveiResponse> => {
    const response = await api.get('/api/respon-survei', { params });
    return response.data;
  },
};