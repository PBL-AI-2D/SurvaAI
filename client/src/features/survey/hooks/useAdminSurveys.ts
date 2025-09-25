import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSurveiService } from '../api/admin';
import {
  CreateAdminSurveiPayload,
  UpdateUserSurveiPayload,
  SurveyListResponse,
  SurveyDetailResponse,
} from '../types/types';

export interface UseAdminSurveysOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useAdminSurveys = (options: UseAdminSurveysOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['admin-surveys', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<SurveyListResponse>({
    queryKey,
    queryFn: () => adminSurveiService.getAll({ page, limit, ...filters }),
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

export const useAdminSurvey = (id: string, enabled = true) => {
  return useQuery<SurveyDetailResponse['data']>({
    queryKey: ['admin-survey', id],
    queryFn: () => adminSurveiService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateAdminSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminSurveiPayload) =>
      adminSurveiService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
    },
  });
};

export const useUpdateAdminSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserSurveiPayload;
    }) => adminSurveiService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-survey', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
    },
  });
};

export const useDeleteAdminSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminSurveiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
    },
  });
};
