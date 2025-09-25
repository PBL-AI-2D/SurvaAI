import { api } from '@/lib/api';
import {
  Hadiah,
  HadiahListResponse,
  CreateHadiahPayload,
  UpdateHadiahPayload,
} from '../types/types';

export const adminHadiahService = {
  getAll: async (params?: Record<string, any>): Promise<HadiahListResponse> => {
    const response = await api.get('/api/hadiah', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Hadiah> => {
    const response = await api.get(`/api/hadiah/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateHadiahPayload): Promise<Hadiah> => {
    const response = await api.post('/api/hadiah', payload);
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateHadiahPayload
  ): Promise<Hadiah> => {
    const response = await api.patch(`/api/hadiah/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/hadiah/${id}`);
  },
};
