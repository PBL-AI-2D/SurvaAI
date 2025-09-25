import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminQuestionSurveyAPI } from "../api/admin";
import {
  SurveyQuestion,
  SurveyQuestionListResponse,
  CreateSurveyQuestionPayload,
  UpdateSurveyQuestionPayload,
} from "../types/types";

export const useAdminInfiniteSurveyQuestions = (surveiId: string, enabled = true) => {
  const query = useInfiniteQuery<SurveyQuestionListResponse>({
    queryKey: ["question-survey", surveiId],
    queryFn: async ({ pageParam = 1 }) =>
      adminQuestionSurveyAPI.getAllBySurveyId(surveiId, {
        page: pageParam,
        limit: 10,
        sort: "index",
      }),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.meta;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  const totalCount = useMemo(() => {
    return query.data?.pages?.[0]?.meta?.total_items ?? 0;
  }, [query.data]);

  return {
    ...query,
    totalCount,
  };
};

export const useAdminSurveyQuestion = (id: string, enabled = true) => {
  return useQuery<SurveyQuestion>({
    queryKey: ["question-survey-detail", id],
    queryFn: () => adminQuestionSurveyAPI.getById(id),
    enabled,
  });
};

export const useCreateAdminSurveyQuestion = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSurveyQuestionPayload) =>
      adminQuestionSurveyAPI.create(surveiId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
    },
  });
};

export const useUpdateAdminSurveyQuestion = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSurveyQuestionPayload }) =>
      adminQuestionSurveyAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
    },
  });
};

export const useDeleteAdminSurveyQuestion = (surveiId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminQuestionSurveyAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-survey', surveiId] });
    },
  });
};
