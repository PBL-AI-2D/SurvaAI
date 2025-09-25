import { useQuery } from '@tanstack/react-query';
import { surveyService } from '@/features/survey/api/public';
import { SurveyDetailResponse, SurveyListResponse } from '../types/types';

export interface UsePublishedSurveysOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

export const usePublishedSurveys = (options: UsePublishedSurveysOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
  } = options;

  const queryKey = ['published-surveys', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useQuery<SurveyListResponse>({
    queryKey,
    queryFn: () =>
      surveyService.getPublishedSurveys({ page, limit, ...filters }),
    staleTime: 1000 * 60,
    refetchInterval: 5000,
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

export const usePublishedSurveyDetail = (id?: string) => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useQuery<SurveyDetailResponse>({
    queryKey: ['published-survey-detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Survey ID is required');
      }
      return surveyService.getPublishedSurvey(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    survey: data?.data,
    isLoading,
    isFetching,
    isError,
    error,
    errorMessage: error?.message || data?.message,
    status: data?.status,
    refetch,
  };
};
