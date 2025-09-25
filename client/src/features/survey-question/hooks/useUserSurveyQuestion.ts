import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { questionSurveyAPI } from '../api/user';
import {
  SurveyQuestion,
  SurveyQuestionListResponse,
  CreateSurveyQuestionPayload,
  UpdateSurveyQuestionPayload,
  UpdateVisualizationTypeSurveyQuestionPayload,
} from '../types/types';
import { useMemo } from 'react';

export const useInfiniteSurveyQuestions = (surveiId: string, enabled = true) => {
  const query = useInfiniteQuery<SurveyQuestionListResponse>({
    queryKey: ['question-survey', surveiId],
    queryFn: async ({ pageParam = 1 }) =>
      questionSurveyAPI.getAllBySurveyId(surveiId, {
        page: pageParam,
        limit: 10,
        sort: 'index',
      }),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.meta;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  const totalCount = useMemo(() => {
    return query.data?.pages?.[0]?.meta?.total_items ?? 0
  }, [query.data]);

  return {
    ...query,
    totalCount,
  };
}

export const useSurveyQuestions = (surveiId: string, enabled = true) => {
  return useQuery<SurveyQuestionListResponse>({
    queryKey: ['question-survey-all', surveiId],
    queryFn: () => questionSurveyAPI.getAllBySurveyId(surveiId),
    enabled,
  });
};

export const useSurveyQuestion = (id: string, enabled = true) => {
  return useQuery<SurveyQuestion>({
    queryKey: ['question-survey', 'detail', id],
    queryFn: () => questionSurveyAPI.getById(id),
    enabled,
  });
};

export const useCreateSurveyQuestion = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSurveyQuestionPayload) =>
      questionSurveyAPI.create(surveiId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['question-survey-all', surveiId] });
    },
  });
};

export const useUpdateSurveyQuestion = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSurveyQuestionPayload;
    }) => questionSurveyAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['question-survey-all', surveiId] });
    },
  });
};

export const useUpdateVisualizationType = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVisualizationTypeSurveyQuestionPayload;
    }) => questionSurveyAPI.updateVisualizationType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['respon-survei-summary', surveiId] });
    },
  });
};

export const useDeleteSurveyQuestion = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => questionSurveyAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['question-survey-all', surveiId] });
    },
  });
};
