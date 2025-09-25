import { api } from '@/lib/api';
import { SurveyListResponse, SurveyDetailResponse } from '../types/types';

export const surveyService = {
  getPublishedSurveys: async (params?: Record<string, any>): Promise<SurveyListResponse> => {
    const response = await api.get('/api/public/survei', {
      params
    });
    return response.data;
  },

  getPublishedSurvey: async (id: string): Promise<SurveyDetailResponse> => {
    const response = await api.get(`/api/public/survei/${id}`);
    return response.data;
  }
};
