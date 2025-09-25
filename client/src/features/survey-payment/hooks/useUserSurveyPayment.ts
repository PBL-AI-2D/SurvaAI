import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyPaymentService } from '../api/user';
import {
  SurveyPayment,
  SurveyPaymentListResponse,
} from '../types/types';

export const useSurveyPayments = (params: Record<string, any> = {}, enabled = true) => {
  const queryKey = ['survey-payments', params];

  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery<SurveyPaymentListResponse>({
    queryKey,
    queryFn: () => surveyPaymentService.getAll(params),
    enabled,
    staleTime: 1000 * 60,
    retry: 2,
  });

  return {
    payments: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useSurveyPayment = (id: string, enabled = true) => {
  return useQuery<SurveyPayment>({
    queryKey: ['survey-payment', id],
    queryFn: () => surveyPaymentService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateSurveyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surveyId: string) => surveyPaymentService.create(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-payments'] });
    },
  });
};
