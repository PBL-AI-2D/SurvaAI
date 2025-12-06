'use client';

import { AIClassificationData } from '@/features/ai-classification/types/types';
import { useResponSurveis } from '@/features/survey-response-result/hooks/useUserSurveyResponseresult';
import { preprocessResponses, calculateResponseStatistics } from '../../utils/preprocessing';

interface SatisfactionAnalysisCardProps {
  surveiId: string;
  analysisData?: AIClassificationData;
  isLoading?: boolean;
  isError?: boolean;
}

export const SatisfactionAnalysisCard = ({
  surveiId,
  analysisData,
  isLoading,
  isError,
}: SatisfactionAnalysisCardProps) => {
  // Fetch responses untuk preprocessing stats
  const { responSurveis, isLoading: isLoadingResponses } = useResponSurveis(surveiId, {
    limit: 1000,
    enabled: !!surveiId,
  });

  if (isLoading || isLoadingResponses) {
    return (
      <div className="rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 p-4 sm:p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Failed to load satisfaction analysis.
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">
          Please ensure the survey has at least 1 completed response with questions and answers.
        </p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 p-4 sm:p-6">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Analysis data is not available yet. Waiting for data...
        </p>
      </div>
    );
  }

  // Calculate preprocessing statistics
  const preprocessed = preprocessResponses(responSurveis);
  const stats = calculateResponseStatistics(preprocessed);

  const satisfactionPct = analysisData.satisfaction_percentage;
  const avgSatisfaction = (analysisData.average_satisfaction * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md p-4 sm:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Satisfaction Analysis</h3>
        <p className="text-xs text-muted-foreground">
          AI analysis based on {analysisData.total_respondents} completed respondents
        </p>
      </div>

      {/* Satisfaction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {satisfactionPct.satisfied.toFixed(1)}%
          </div>
          <div className="text-xs text-green-600 dark:text-green-500 mt-1">Satisfied</div>
          <div className="text-xs text-muted-foreground mt-1">
            {analysisData.sentiment_distribution.positive} respondents
          </div>
        </div>

        <div className="flex flex-col p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {satisfactionPct.neutral.toFixed(1)}%
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Neutral</div>
          <div className="text-xs text-muted-foreground mt-1">
            {analysisData.sentiment_distribution.neutral} respondents
          </div>
        </div>

        <div className="flex flex-col p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            {satisfactionPct.unsatisfied.toFixed(1)}%
          </div>
          <div className="text-xs text-red-600 dark:text-red-500 mt-1">Unsatisfied</div>
          <div className="text-xs text-muted-foreground mt-1">
            {analysisData.sentiment_distribution.negative} respondents
          </div>
        </div>
      </div>

      {/* Average Satisfaction */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Average Satisfaction</div>
            <div className="text-xs text-muted-foreground mt-1">Scale 0-100</div>
          </div>
          <div className="text-3xl font-bold text-primary">{avgSatisfaction}</div>
        </div>
        <div className="mt-3 w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${avgSatisfaction}%` }}
          ></div>
        </div>
      </div>

      {/* Preprocessing Statistics */}
      <div className="border-t border-glass-border pt-4">
        <h4 className="text-sm font-semibold mb-3">Response Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-muted-foreground">Total Response</div>
            <div className="font-semibold mt-1">{stats.total}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Completed</div>
            <div className="font-semibold mt-1">{stats.completed}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Completion Rate</div>
            <div className="font-semibold mt-1">{stats.completion_rate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">With Text</div>
            <div className="font-semibold mt-1">{stats.with_text}</div>
          </div>
        </div>
      </div>

      {/* Major Preference */}
      {analysisData.major_preference && (
        <div className="border-t border-glass-border pt-4">
          <h4 className="text-sm font-semibold mb-2">Major Preference</h4>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="font-medium">{analysisData.major_preference.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {analysisData.major_preference.percentage.toFixed(1)}% respondents
            </div>
          </div>
        </div>
      )}

      {/* Segments */}
      {analysisData.segments && analysisData.segments.length > 0 && (
        <div className="border-t border-glass-border pt-4">
          <h4 className="text-sm font-semibold mb-3">Respondent Segmentation</h4>
          <div className="space-y-2">
            {analysisData.segments.slice(0, 3).map((segment) => (
              <div
                key={segment.segment_id}
                className="p-3 rounded-lg bg-muted/30 border border-glass-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Segment {segment.segment_id}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {segment.respondent_count} respondents
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        segment.satisfaction_status === 'high'
                          ? 'text-green-600'
                          : segment.satisfaction_status === 'medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {segment.satisfaction_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

