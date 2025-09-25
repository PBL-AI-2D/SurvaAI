import { api } from '@/lib/api';
import {
  ResponSurveiDraft,
  ResponSurveiPayload,
} from '../types/types';

export const surveyResponseSubmissionService = {
  getDraft: async (surveiId: string): Promise<ResponSurveiDraft> => {
    const response = await api.get(`/api/survei/${surveiId}/respon-survei/draft`);
    return response.data;
  },

  saveDraft: async (
    surveiId: string,
    respon: ResponSurveiPayload
  ): Promise<any> => {
    const response = await api.patch(`/api/survei/${surveiId}/respon-survei/draft`, {
      respon,
    });
    return response.data;
  },

  submitFinal: async (surveiId: string): Promise<any> => {
    const response = await api.post(`/api/survei/${surveiId}/respon-survei/submit`);
    return response.data;
  },
};
