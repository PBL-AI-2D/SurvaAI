import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userSurveiService } from '../api/user';
import {
  Survei,
  CreateUserSurveiPayload,
  UpdateUserSurveiPayload,
  SurveyListResponse,
} from '../types/types';

export interface UseUserSurveysOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useUserSurveys = (options: UseUserSurveysOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['user-surveys', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<SurveyListResponse>({
    queryKey,
    queryFn: () => userSurveiService.getAll({ page, limit, ...filters }),
    enabled,
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

export const useUserSurvey = (id: string, enabled = true) => {
  return useQuery<Survei>({
    queryKey: ['user-survey', id],
    queryFn: () => userSurveiService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateUserSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserSurveiPayload) =>
      userSurveiService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-surveys'] });
    },
  });
};

export const useUpdateUserSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserSurveiPayload;
    }) => userSurveiService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['user-survey', id] });
      queryClient.invalidateQueries({ queryKey: ['user-surveys'] });
    },
  });
};

export const useDeleteUserSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userSurveiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-surveys'] });
    },
  });
};
