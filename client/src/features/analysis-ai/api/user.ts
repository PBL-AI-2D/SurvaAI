import { api } from '@/lib/api';
import {
  AnalisisAi,
  AnalysisStatus,
  AnalysisListResponse,
  UpdateAnalysisStatusPayload,
} from '../types/types';

export const analysisAiService = {
  getById: async (id: string): Promise<AnalisisAi> => {
    const response = await api.get(`/api/ai/analyses/${id}`);
    return response.data.data;
  },

  getStatus: async (surveiId: string): Promise<AnalysisStatus> => {
    const response = await api.get(`/api/ai/analyses/survey/${surveiId}/status`);
    return response.data.data;
  },

  getBySurvey: async (
    surveiId: string,
    params?: Record<string, any>
  ): Promise<AnalysisListResponse> => {
    const response = await api.get(`/api/ai/analyses/survey/${surveiId}`, { params });
    return response.data;
  },

  updateStatus: async (
    id: string,
    payload: UpdateAnalysisStatusPayload
  ): Promise<AnalisisAi> => {
    const response = await api.patch(`/api/ai/analyses/${id}/status`, payload);
    return response.data.data;
  },
};






