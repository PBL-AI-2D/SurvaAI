import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { penggunaService } from '../api/admin';
import {
  GetPenggunasResponse,
  GetPenggunaResponse,
  CreatePenggunaPayload,
  UpdatePenggunaPayload,
} from '../types/types';

export interface UsePenggunasOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const usePenggunas = (options: UsePenggunasOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['penggunas', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<GetPenggunasResponse>({
    queryKey,
    queryFn: () => penggunaService.getAll({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    penggunas: data?.data || [],
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

export const usePengguna = (id: string, enabled = true) => {
  return useQuery<GetPenggunaResponse>({
    queryKey: ['pengguna', id],
    queryFn: () => penggunaService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreatePengguna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePenggunaPayload) =>
      penggunaService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penggunas'] });
    },
  });
};

export const useUpdatePengguna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePenggunaPayload;
    }) => penggunaService.update( id, payload ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pengguna', id] });
      queryClient.invalidateQueries({ queryKey: ['penggunas'] });
    },
  });
};

export const useDeletePengguna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => penggunaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penggunas'] });
    },
  });
};
