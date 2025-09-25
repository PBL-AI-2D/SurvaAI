import { api } from '@/lib/api';
import { OpinionPayload } from '../types/types';

export const opinionService = {
  sendOpinion: async (payload: OpinionPayload): Promise<any> => {
    const response = await api.post('/api/public/email/opinion', payload);
    return response.data;
  },
};
