import { api } from '@/lib/api';
import {
  SurveyQuestion,
  SurveyQuestionListResponse,
  CreateSurveyQuestionPayload,
  UpdateSurveyQuestionPayload,
  UpdateVisualizationTypeSurveyQuestionPayload,
} from '../types/types';

export const questionSurveyAPI = {
  getAllBySurveyId: async (
    surveiId: string,
    params?: Record<string, any>
  ): Promise<SurveyQuestionListResponse> => {
    const response = await api.get(`/api/users/survei/${surveiId}/pertanyaan-survei`, { params });
    return response.data;
  },

  getById: async (surveiId: string): Promise<SurveyQuestion> => {
    const response = await api.get(`/api/users/pertanyaan-survei/${surveiId}`);
    return response.data.data;
  },

  create: async (
    surveiId: string,
    payload: CreateSurveyQuestionPayload
  ): Promise<SurveyQuestion> => {
    const response = await api.post(`/api/users/survei/${surveiId}/pertanyaan-survei`, payload);
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateSurveyQuestionPayload
  ): Promise<SurveyQuestion> => {
    const response = await api.patch(`/api/users/pertanyaan-survei/${id}`, payload);
    return response.data.data;
  },

  updateVisualizationType: async (
    id: string,
    payload: UpdateVisualizationTypeSurveyQuestionPayload
  ): Promise<SurveyQuestion> => {
    const response = await api.patch(`/api/users/pertanyaan-survei/${id}/tipe-visualisasi`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/pertanyaan-survei/${id}`);
  },
};
