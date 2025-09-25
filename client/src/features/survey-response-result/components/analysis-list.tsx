'use client';

import { useResponSurveiSummary } from '../hooks/useUserSurveyResponseresult';
import { Card, CardContent } from '@/components/ui/card';
import { VisualRenderer } from './visual-renderer';
import { VisualizationTypeSelect } from '@/features/survey-question/components/user/visualization-type-update';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface AnalysisListProps {
  surveyId: string;
}

export const AnalysisList = ({ surveyId }: AnalysisListProps) => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;
  const { data, isLoading, isError, refetch } = useResponSurveiSummary(surveyId, shouldFetch);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(1)].map((_, i) => (
          <div
            key={i}
            className="h-[400px] w-full rounded-xl animate-pulse bg-glass-bg backdrop-blur-md border border-glass-border"
            style={{
              background: 'var(--glass-background)',
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-grow flex-col items-center justify-center text-center gap-4 min-h-[200px] px-6 py-8 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <p className="text-sm text-destructive">
          Failed to load analysis data.
        </p>
        {typeof refetch === 'function' && (
          <Button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium rounded-md border border-glass-border bg-destructive/30 hover:bg-destructive/50 transition text-foreground backdrop-blur-md shadow-sm"
            style={{
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div
        className="flex flex-grow items-center justify-center min-h-[200px] px-6 py-8 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm text-muted-foreground text-sm italic"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        No summary available for this survey yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((summary) => (
        <Card
          key={summary.id_pertanyaan}
          className="w-full border border-glass-border rounded-xl p-4 gap-1 space-y-4 bg-glass-bg backdrop-blur-md shadow-md text-foreground"
          style={{
            background: 'var(--glass-background)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'var(--glass-blur)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="font-semibold text-sm flex items-start gap-2">
            <span>{summary.index}.</span>
            <span className="break-words whitespace-pre-wrap">{summary.teks_pertanyaan}</span>
          </div>

          <VisualizationTypeSelect
            questionId={summary.id_pertanyaan}
            surveiId={surveyId}
            defaultValue={summary.tipe_visualisasi}
            tipePertanyaan={summary.tipe_pertanyaan}
          />

          <CardContent className="flex justify-center p-0 text-sm w-full h-full min-h-[250px] max-h-[300px]">
            <div className="container max-w-[600px]">
              <VisualRenderer summary={summary} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
