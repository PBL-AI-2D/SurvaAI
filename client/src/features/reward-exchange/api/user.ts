import { api } from '@/lib/api';
import {
  RewardExchange,
  RewardExchangeListResponse,
  CreateRewardExchangePayload,
} from '../types/types';

export const rewardExchangeService = {
  getAll: async (params?: Record<string, any>): Promise<RewardExchangeListResponse> => {
    const response = await api.get('/api/users/penukaran-hadiah', { params });
    return response.data;
  },

  getById: async (id: string): Promise<RewardExchange> => {
    const response = await api.get(`/api/users/penukaran-hadiah/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateRewardExchangePayload): Promise<RewardExchange> => {
    const response = await api.post('/api/users/penukaran-hadiah', payload);
    return response.data.data;
  },
};
