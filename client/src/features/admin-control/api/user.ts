import { api } from '@/lib/api';
import {
  ThresholdConfig,
  SystemStatus,
  TriggerAnalysisResponse,
  ResetAnalysisResponse,
  ClearCacheResponse,
} from '../types/types';

export const adminControlService = {
  triggerAnalysis: async (surveiId: string): Promise<TriggerAnalysisResponse> => {
    const response = await api.post(`/api/admin/control/survey/${surveiId}/trigger-analysis`);
    return response.data.data;
  },

  resetAnalysis: async (surveiId: string): Promise<ResetAnalysisResponse> => {
    const response = await api.post(`/api/admin/control/survey/${surveiId}/reset-analysis`);
    return response.data;
  },

  getThresholdConfig: async (): Promise<ThresholdConfig> => {
    const response = await api.get('/api/admin/control/threshold-config');
    return response.data.data;
  },

  updateThresholdConfig: async (
    config: Partial<ThresholdConfig>
  ): Promise<ThresholdConfig> => {
    const response = await api.put('/api/admin/control/threshold-config', config);
    return response.data.data;
  },

  clearCache: async (pattern?: string): Promise<ClearCacheResponse> => {
    const response = await api.delete('/api/admin/control/cache', {
      params: pattern ? { pattern } : undefined,
    });
    return response.data.data;
  },

  getSystemStatus: async (): Promise<SystemStatus> => {
    const response = await api.get('/api/admin/control/system-status');
    return response.data.data;
  },
};






