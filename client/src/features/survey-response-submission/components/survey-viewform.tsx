'use client';

import { useState, useEffect } from 'react';
import { usePublishedSurveyDetail } from '@/features/survey/hooks/usePublishedSurveys';
import {
  useResponseSurveySubmissionDraft,
  useSaveResponseSurveySubmissionDraft,
  useSubmitResponseSurveySubmission,
} from '../hooks/useUserSurveyResponseSubmission';
import { toast } from 'sonner';
import { QuestionRenderer } from './question-renderer';
import { useAutosave } from '@/hooks/useAutoSave';
import { SurveyNavigation } from './survey-navigation';
import { FinishedSurvey } from './finished-survey';
import { Separator } from '@/components/ui/separator';

interface SurveyViewFormProps {
  surveiId: string;
}

export function SurveyViewForm({ surveiId }: SurveyViewFormProps) {
  const { survey, isLoading: surveyLoading } = usePublishedSurveyDetail(surveiId);
  const { data: draft, isLoading: draftLoading } = useResponseSurveySubmissionDraft(surveiId);
  const saveDraft = useSaveResponseSurveySubmissionDraft(surveiId);
  const submit = useSubmitResponseSurveySubmission(surveiId);

  const pertanyaanList = survey?.PertanyaanSurveis || [];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const autosave = useAutosave<Record<string, any>>((latestDraft) => {
    saveDraft.mutate(latestDraft);
  }, 1500);

  useEffect(() => {
    if (draft?.data?.draft) {
      setAnswers(draft.data.draft);
    }
  }, [draft]);

  const currentQuestion = pertanyaanList[currentStep];

  const handleAnswer = (val: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [currentQuestion.id]: val };
      autosave(updated);
      return updated;
    });
  };

  const handleSubmit = () => {
    const unanswered = pertanyaanList.find(
      (q) => q.is_required && !answers[q.id]
    );
    if (unanswered) {
      toast.error('Required question is not answered.');
      return;
    }

    submit.mutate(undefined, {
      onSuccess: () => {
        toast.success('Survey submitted successfully!');
        setSubmitted(true);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message;
        toast.error(msg || 'Submission failed.');
      },
    });
  };

  if (surveyLoading || draftLoading) {
    return (
      <div
        className="rounded-xl p-6 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm text-sm text-muted-foreground"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        Loading survey...
      </div>
    );
  }

  if (!survey || pertanyaanList.length === 0) {
    return (
      <div
        className="rounded-xl p-6 border border-red-300 bg-red-100 dark:bg-red-900/20 backdrop-blur-xl shadow-sm text-sm text-red-700"
        style={{
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        Survey not found.
      </div>
    );
  }

  if (submitted) return <FinishedSurvey points={survey.hadiah_poin} />;

  return (
    <div className="flex flex-col flex-grow space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{survey.judul}</h2>

      <Separator className="bg-foreground/30" />

      <div className="flex-grow">
        <QuestionRenderer
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={handleAnswer}
        />
      </div>

      <SurveyNavigation
        questions={pertanyaanList}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        answers={answers}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
