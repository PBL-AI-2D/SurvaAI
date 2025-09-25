import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { surveyPaymentAdminService } from '../api/admin'
import { AdminSurveyPayment, AdminSurveyPaymentListResponse } from '../types/types'

export interface UseAdminSurveyPaymentOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useAdminSurveyPayments = (options: UseAdminSurveyPaymentOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
  } = options;

  const queryKey = ['admin-survey-payments', { page, limit, ...filters }];

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<AdminSurveyPaymentListResponse>({
    queryKey,
    queryFn: () => surveyPaymentAdminService.getAll({ page, limit, ...filters }),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    payments: data?.data || [],
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

export const useAdminSurveyPayment = (id: string, enabled = true) => {
  return useQuery<AdminSurveyPayment>({
    queryKey: ['admin-survey-payment', id],
    queryFn: () => surveyPaymentAdminService.getById(id),
    enabled: !!id && enabled,
  })
}

export const useDeleteAdminSurveyPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => surveyPaymentAdminService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-survey-payments'] })
    },
  })
}
