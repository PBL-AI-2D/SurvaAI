import { api } from '@/lib/api';

export const surveyVerificationAPI = {
  submit: async (id: string): Promise<any> => {
    const response = await api.post(`/api/users/survei/submit-verifikasi/${id}`);
    return response.data.data;
  },
};
