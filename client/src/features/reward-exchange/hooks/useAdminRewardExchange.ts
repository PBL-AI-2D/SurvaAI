import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RewardExchange,
  RewardExchangeListResponse,
  CreateAdminRewardExchangePayload,
} from '../types/types';
import { adminRewardExchangeService } from '../api/admin';

export interface UseAdminRewardExchangeOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useAdminRewardExchangeList = (
  options: UseAdminRewardExchangeOptions = {}
) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['admin-reward-exchanges', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<RewardExchangeListResponse>({
    queryKey,
    queryFn: () =>
      adminRewardExchangeService.getAll({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    rewardExchanges: data?.data || [],
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

export const useAdminRewardExchange = (id: string, enabled = true) => {
  return useQuery<RewardExchange>({
    queryKey: ['admin-reward-exchange', id],
    queryFn: () => adminRewardExchangeService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useAdminCreateRewardExchange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminRewardExchangePayload) =>
      adminRewardExchangeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reward-exchanges'] });
    },
  });
};

export const useAdminDeleteRewardExchange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRewardExchangeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reward-exchanges'] });
    },
  });
};
