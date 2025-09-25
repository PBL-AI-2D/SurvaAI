import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateHadiahPayload,
  UpdateHadiahPayload,
  Hadiah,
  HadiahListResponse,
} from '../types/types';
import { adminHadiahService } from '../api/admin';

export interface UseAdminHadiahOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useAdminHadiahList = (options: UseAdminHadiahOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['admin-hadiahs', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<HadiahListResponse>({
    queryKey,
    queryFn: () =>
      adminHadiahService.getAll({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    hadiahs: data?.data || [],
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

export const useAdminHadiah = (id: string, enabled = true) => {
  return useQuery<Hadiah>({
    queryKey: ['admin-hadiah', id],
    queryFn: () => adminHadiahService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useAdminCreateHadiah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateHadiahPayload) =>
      adminHadiahService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hadiahs'] });
    },
  });
};

export const useAdminUpdateHadiah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHadiahPayload }) =>
      adminHadiahService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-hadiah', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-hadiahs'] });
    },
  });
};

export const useAdminDeleteHadiah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminHadiahService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hadiahs'] });
    },
  });
};
