'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/umum/confirm-dialog';
import { SurveyForm } from './survey-form';
import {
  useUserSurvey,
  useUpdateUserSurvey,
  useDeleteUserSurvey,
} from '@/features/survey/hooks/useUserSurveys';
import { QuestionSection } from '@/features/survey-question/components/user/question-section';
import SubmitButton from '@/features/survey-verification/components/user/submit-button';
import { useSurveyQuestions } from '@/features/survey-question/hooks/useUserSurveyQuestion';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CreateSurveyPaymentButton } from '@/features/survey-payment/components/user/payment-button';

interface SurveyContainerProps {
  surveyId: string;
}

export function SurveyContainer({ surveyId }: SurveyContainerProps) {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const { data: survey, isLoading, isError, error } = useUserSurvey(surveyId, shouldFetch);
  const updateSurvey = useUpdateUserSurvey();
  const deleteSurvey = useDeleteUserSurvey();
  const isEditable = survey?.status === 'draft' || survey?.status === 'rejected';
  const { data: fullQuestionResponse } = useSurveyQuestions(surveyId, shouldFetch);
  const totalQuestions = fullQuestionResponse?.data?.length ?? 0;

  const stableKriteria = useMemo(() => survey?.kriteria ?? {}, [JSON.stringify(survey?.kriteria)]);

  const initialForm = useMemo(() => ({
    judul: survey?.judul,
    deskripsi: survey?.deskripsi ?? '',
    kriteria: stableKriteria,
    jumlah_responden: survey?.jumlah_responden,
    tanggal_mulai: survey?.tanggal_mulai,
    tanggal_berakhir: survey?.tanggal_berakhir,
    status: survey?.status,
    umpan_balik: survey?.umpan_balik,
  }), [survey, stableKriteria]);

  useEffect(() => {
    if (updateSurvey.isSuccess) toast.success('Survey changes saved successfully.');
    if (updateSurvey.isError) toast.error('Failed to save survey changes.');
  }, [updateSurvey.isSuccess, updateSurvey.isError]);

  useEffect(() => {
    if (deleteSurvey.isSuccess) {
      toast.success('Survey deleted successfully.');
      router.push('/manage-survey');
    }
    if (deleteSurvey.isError) {
      toast.error('Failed to delete survey.');
    }
  }, [deleteSurvey.isSuccess, deleteSurvey.isError]);

  if (!shouldFetch) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-sm text-muted-foreground">
        <div className="animate-pulse">Preparing access...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-sm text-muted-foreground">
        <div className="animate-pulse">Loading survey data...</div>
      </div>
    );
  }

  if (isError || !survey) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-sm text-destructive">
        Failed to load survey: {error?.message || 'Unknown error.'}
      </div>
    );
  }

  return (
    <div className="flex-grow">
      <div
        className="grid rounded-2xl sm:p-10 p-5 gap-4 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md "
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <div className="flex flex-wrap justify-between gap-2">
          <ConfirmDialog
            title="Delete Survey"
            description="Are you sure you want to permanently delete this survey?"
            actionLabel="Yes, Delete"
            isLoading={deleteSurvey.isPending}
            onConfirm={() => deleteSurvey.mutate(surveyId)}
            actionClassName="
              bg-red-400/30 hover:bg-red-400/50 
              text-foreground border border-glass-border 
              backdrop-blur-md shadow-sm transition"
          >
          <Button
            className="w-full sm:w-fit text-sm font-semibold px-4 py-2 rounded-md 
              bg-red-400/30 hover:bg-red-500/30 text-red-900 dark:text-red-100 
              border border-red-300/40 dark:border-red-500/40 
              backdrop-blur-md shadow-md transition"
            style={{
              backdropFilter: 'var(--glass-blur)',
              borderColor: 'var(--glass-border)',
            }}
          >
            Delete Survey
          </Button>
          </ConfirmDialog>

          {isEditable && totalQuestions > 0 && (
            <SubmitButton surveiId={surveyId} />
          )}

          {survey.status === 'payment_pending' && (
            <CreateSurveyPaymentButton surveyId={surveyId} />
          )}
        </div>

        <SurveyForm
          surveyId={surveyId}
          initialData={initialForm}
          onAutoSave={(formData: any) =>
            updateSurvey.mutate({ id: surveyId, data: formData })
          }
          disabled={!isEditable}
        />

        <h2 className="text-xl font-semibold px-2 pt-6">Survey Questions</h2>
        <QuestionSection surveyId={surveyId} isEditable={isEditable} />
      </div>
    </div>
  );
}
