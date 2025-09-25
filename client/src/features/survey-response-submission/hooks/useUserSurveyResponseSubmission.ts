import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyResponseSubmissionService } from '../api/user';
import { ResponSurveiDraft, ResponSurveiPayload } from '../types/types';

export const useResponseSurveySubmissionDraft = (surveiId: string, enabled = true) => {
  return useQuery<ResponSurveiDraft>({
    queryKey: ['respon-survei', surveiId, 'draft'],
    queryFn: () => surveyResponseSubmissionService.getDraft(surveiId),
    enabled: !!surveiId && enabled,
  });
};

export const useSaveResponseSurveySubmissionDraft = (surveiId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (respon: ResponSurveiPayload) =>
      surveyResponseSubmissionService.saveDraft(surveiId, respon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respon-survei', surveiId, 'draft'] });
    },
  });
};

export const useSubmitResponseSurveySubmission = (surveiId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => surveyResponseSubmissionService.submitFinal(surveiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respon-survei', surveiId, 'draft'] });
    },
  });
};
