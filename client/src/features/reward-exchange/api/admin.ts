import { api } from '@/lib/api';
import {
  RewardExchange,
  RewardExchangeListResponse,
  CreateAdminRewardExchangePayload,
} from '../types/types';

export const adminRewardExchangeService = {
  getAll: async (params?: Record<string, any>): Promise<RewardExchangeListResponse> => {
    const response = await api.get('/api/penukaran-hadiah', { params });
    return response.data;
  },

  getById: async (id: string): Promise<RewardExchange> => {
    const response = await api.get(`/api/penukaran-hadiah/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateAdminRewardExchangePayload): Promise<RewardExchange> => {
    const response = await api.post('/api/penukaran-hadiah', payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/penukaran-hadiah/${id}`);
  },
};