import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { segmentService } from '../api/user';
import { CompareSegmentsPayload } from '../types/types';

export const useSegmentsBySurvey = (
  surveiId: string,
  params?: Record<string, any>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['segments', surveiId, params],
    queryFn: () => segmentService.getBySurvey(surveiId, params),
    enabled: enabled && !!surveiId,
  });
};

export const useSegmentById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['segment', id],
    queryFn: () => segmentService.getById(id),
    enabled: enabled && !!id,
  });
};

export const useSegmentDetails = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['segment-details', id],
    queryFn: () => segmentService.getDetails(id),
    enabled: enabled && !!id,
  });
};

export const useSegmentHistory = (
  surveiId: string,
  clusterLabel: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['segment-history', surveiId, clusterLabel],
    queryFn: () => segmentService.getHistory(surveiId, clusterLabel),
    enabled: enabled && !!surveiId && !!clusterLabel,
  });
};

export const useCompareSegments = () => {
  return useMutation({
    mutationFn: (payload: CompareSegmentsPayload) => segmentService.compare(payload),
  });
};





