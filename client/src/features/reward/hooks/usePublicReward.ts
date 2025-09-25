import { useQuery } from '@tanstack/react-query';
import { hadiahService } from '../api/public';
import { HadiahListResponse } from '../types/types';

export interface UseHadiahsOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useHadiahs = (options: UseHadiahsOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['hadiahs', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<HadiahListResponse>({
    queryKey,
    queryFn: () => hadiahService.getAll({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchInterval: 5000,
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
