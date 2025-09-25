import { api } from '@/lib/api';
import {
  ResponSurvei,
  ResponSurveiListResponse,
  ResponSummary,
} from '../types/types';

export const responSurveiService = {
  getAll: async (
    surveiId: string,
    params?: Record<string, any>
  ): Promise<ResponSurveiListResponse> => {
    const response = await api.get(`/api/users/survei/${surveiId}/respon-survei`, { params });
    return response.data;
  },

  getById: async (
    surveiId: string,
    id: string
  ): Promise<ResponSurvei> => {
    const response = await api.get(`/api/users/survei/${surveiId}/respon-survei/${id}`);
    return response.data.data;
  },

  getSummary: async (surveiId: string): Promise<ResponSummary[]> => {
    const response = await api.get(`/api/users/survei/${surveiId}/summary`);
    return response.data.data;
  },

  export: async (surveiId: string, format: 'csv' | 'xlsx'): Promise<Blob> => {
    const response = await api.get(`/api/users/survei/${surveiId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
