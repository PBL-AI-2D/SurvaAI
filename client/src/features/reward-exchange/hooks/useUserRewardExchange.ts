import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardExchangeService } from '../api/user';
import {
  RewardExchange,
  CreateRewardExchangePayload,
  RewardExchangeListResponse,
} from '../types/types';

export interface UseRewardExchangeOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useRewardExchanges = (options: UseRewardExchangeOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['reward-exchanges', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<RewardExchangeListResponse>({
    queryKey,
    queryFn: () => rewardExchangeService.getAll({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    exchanges: data?.data || [],
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

export const useRewardExchange = (id: string, enabled = true) => {
  return useQuery<RewardExchange>({
    queryKey: ['reward-exchange', id],
    queryFn: () => rewardExchangeService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateRewardExchange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRewardExchangePayload) =>
      rewardExchangeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
