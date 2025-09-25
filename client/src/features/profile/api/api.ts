import { api } from '@/lib/api';
import { UserProfileResponse, UpdateProfilePayload } from '../types/types';

export const profileService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfileResponse> => {
    const response = await api.patch('/api/users/profile', payload);
    return response.data;
  },
};
