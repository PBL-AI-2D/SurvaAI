import { useQuery } from '@tanstack/react-query';
import { adminSurveyResponseService } from '../api/admin';
import { ResponSurveiResponse } from '../types/types';

export interface UseAdminSurveyResponsesOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useAdminSurveyResponses = (options: UseAdminSurveyResponsesOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['admin-survey-responses', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<ResponSurveiResponse>({
    queryKey,
    queryFn: () => adminSurveyResponseService.getAllItems({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    surveys: data?.data || [],
    meta: data?.meta,
    isLoading,
    isFetching,
    isError,
    error,
    errorMessage: error?.message || data?.message,
    status: data?.status,
    refetch,
  };
};