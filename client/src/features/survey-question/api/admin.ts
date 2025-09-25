import { api } from "@/lib/api";
import {
  SurveyQuestion,
  SurveyQuestionListResponse,
  CreateSurveyQuestionPayload,
  UpdateSurveyQuestionPayload,
} from "../types/types";

export const adminQuestionSurveyAPI = {
  getAllBySurveyId: async (
    surveiId: string,
    params?: Record<string, any>
  ): Promise<SurveyQuestionListResponse> => {
    const response = await api.get(`/api/survei/${surveiId}/pertanyaan-survei`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<SurveyQuestion> => {
    const response = await api.get(`/api/pertanyaan-survei/${id}`);
    return response.data.data;
  },

  create: async (
    surveiId: string,
    payload: CreateSurveyQuestionPayload
  ): Promise<SurveyQuestion> => {
    const response = await api.post(`/api/survei/${surveiId}/pertanyaan-survei`, payload);
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateSurveyQuestionPayload
  ): Promise<SurveyQuestion> => {
    const response = await api.patch(`/api/pertanyaan-survei/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/pertanyaan-survei/${id}`);
  },
};
