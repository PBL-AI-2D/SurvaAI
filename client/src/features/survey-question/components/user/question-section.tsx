'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QuestionCard } from '@/features/survey-question/components/user/question-card';
import {
  useInfiniteSurveyQuestions,
  useCreateSurveyQuestion,
  useUpdateSurveyQuestion,
  useDeleteSurveyQuestion,
} from '@/features/survey-question/hooks/useUserSurveyQuestion';
import { SurveyQuestion, UpdateSurveyQuestionPayload } from '@/features/survey-question/types/types';
import { defaultSurveyQuestionPayload } from '@/features/survey-question/constant/constants';

interface QuestionSectionProps {
  surveyId: string;
  isEditable: boolean;
}

export function QuestionSection({ surveyId, isEditable }: QuestionSectionProps) {
  const {
    data,
    totalCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useInfiniteSurveyQuestions(surveyId);

  const createQuestion = useCreateSurveyQuestion(surveyId);
  const updateQuestion = useUpdateSurveyQuestion(surveyId);
  const deleteQuestion = useDeleteSurveyQuestion(surveyId);

  const handleAddQuestion = () => {
    createQuestion.mutate(defaultSurveyQuestionPayload, {
      onSuccess: () => toast.success('Question added successfully.'),
      onError: () => toast.error('Failed to add question.'),
    });
  };

  const handleUpdateQuestion = (id: string, updates: Partial<UpdateSurveyQuestionPayload>) => {
    const toastId = toast.loading('Saving changes...');
    updateQuestion.mutate(
      { id, payload: updates },
      {
        onSuccess: () => toast.success('Changes saved.', { id: toastId }),
        onError: () => toast.error('Failed to save changes.', { id: toastId }),
      }
    );
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion.mutate(id, {
      onSuccess: () => toast.success('Question deleted.'),
      onError: () => toast.error('Failed to delete question.'),
    });
  };

  const allQuestions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <div className="text-xs w-full text-center text-muted-foreground">
        Loading survey questions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-xs w-full text-center text-red-500">
        Failed to load questions: {error?.message || 'Unknown error'}
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="text-xs w-full text-center text-foreground">
        No questions yet. Add your first question.
        <div className="mt-3">
          <Button
            variant="outline"
            className="bg-glass-bg border-glass-border backdrop-blur-md text-foreground"
            onClick={handleAddQuestion}
            disabled={createQuestion.isPending || !isEditable}
          >
            {createQuestion.isPending ? 'Adding...' : 'Add Question'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      {allQuestions.map((q: SurveyQuestion) => (
        <QuestionCard
          key={q.id}
          question={{
            id: q.id,
            teks_pertanyaan: q.teks_pertanyaan,
            tipe_pertanyaan: q.tipe_pertanyaan,
            opsi: q.opsi || [],
            is_required: q.is_required,
            index: q.index,
          }}
          onChange={handleUpdateQuestion}
          onDelete={handleDeleteQuestion}
          isDeleting={deleteQuestion.isPending && deleteQuestion.variables === q.id}
          disabled={!isEditable}
        />
      ))}

      {hasNextPage && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground text-center">
            Showing {allQuestions.length} of {totalCount} questions
            ({totalCount - allQuestions.length} hidden)
          </span>
          <Button
            variant="outline"
            className="bg-glass-bg border-glass-border backdrop-blur-md hover:text-foreground"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {isEditable && (
        <Button
          variant="ghost"
          className="w-fit bg-glass-bg border-glass-border backdrop-blur-md text-foreground self-center mt-4"
          onClick={handleAddQuestion}
          disabled={createQuestion.isPending}
        >
          {createQuestion.isPending ? 'Adding...' : 'Add Question'}
        </Button>
      )}
    </div>
  );
}
