import { api } from '@/lib/api';
import { HadiahListResponse } from '../types/types';

export const hadiahService = {
  getAll: async (params?: Record<string, any>): Promise<HadiahListResponse> => {
    const response = await api.get('/api/public/hadiah', { params });
    return response.data;
  },
};
