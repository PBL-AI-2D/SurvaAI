import { api } from '@/lib/api';
import {
  Survei,
  SurveyListResponse,
  SurveyDetailResponse,
  CreateAdminSurveiPayload,
  UpdateUserSurveiPayload,
} from '../types/types';

export const adminSurveiService = {
  getAll: async (params?: Record<string, any>): Promise<SurveyListResponse> => {
    const response = await api.get('/api/survei', { params });
    return response.data;
  },

  getById: async (id: string): Promise<SurveyDetailResponse['data']> => {
    const response = await api.get(`/api/survei/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateAdminSurveiPayload): Promise<Survei> => {
    const response = await api.post('/api/survei', payload);
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateUserSurveiPayload
  ): Promise<Survei> => {
    const response = await api.patch(`/api/survei/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/survei/${id}`);
  },
};
