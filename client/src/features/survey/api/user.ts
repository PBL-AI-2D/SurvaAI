import { api } from '@/lib/api';
import {
  Survei,
  SurveyListResponse,
  CreateUserSurveiPayload,
  UpdateUserSurveiPayload,
} from '../types/types';

export const userSurveiService = {
  getAll: async (params?: Record<string, any>): Promise<SurveyListResponse> => {
    const response = await api.get('/api/users/survei', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Survei> => {
    const response = await api.get(`/api/users/survei/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateUserSurveiPayload): Promise<Survei> => {
    const response = await api.post('/api/users/survei', payload);
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateUserSurveiPayload
  ): Promise<Survei> => {
    const response = await api.patch(`/api/users/survei/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/survei/${id}`);
  },
};
