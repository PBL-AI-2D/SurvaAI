import { api } from '@/lib/api';
import {
  Segment,
  SegmentDetail,
  SegmentComparison,
  SegmentHistory,
  SegmentListResponse,
  CompareSegmentsPayload,
} from '../types/types';

export const segmentService = {
  getBySurvey: async (
    surveiId: string,
    params?: Record<string, any>
  ): Promise<SegmentListResponse> => {
    const response = await api.get(`/api/ai/segments/survey/${surveiId}`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Segment> => {
    const response = await api.get(`/api/ai/segments/${id}`);
    return response.data.data;
  },

  getDetails: async (id: string): Promise<SegmentDetail> => {
    const response = await api.get(`/api/ai/segments/${id}/details`);
    return response.data.data;
  },

  compare: async (payload: CompareSegmentsPayload): Promise<SegmentComparison> => {
    const response = await api.post('/api/ai/segments/compare', payload);
    return response.data.data;
  },

  getHistory: async (
    surveiId: string,
    clusterLabel: string
  ): Promise<SegmentHistory[]> => {
    const response = await api.get(`/api/ai/segments/survey/${surveiId}/history`, {
      params: { cluster_label: clusterLabel },
    });
    return response.data.data;
  },
};






