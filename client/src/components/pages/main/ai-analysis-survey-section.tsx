"use client";

import { Lightbulb } from "lucide-react";
import { ClassificationChart } from "./charts/classification-chart";
import { PreferencesChart } from "./charts/preferences-chart";
import { SatisfactionTrendChart } from "./charts/satisfaction-trend-chart";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import { useResponSurveis } from "@/features/survey-response-result/hooks/useUserSurveyResponseresult";
import { processSatisfactionTrend } from "@/features/survey/utils/chart-data-processor";

interface AIAnalysisSurveySectionProps {
  readonly surveyId: string;
}

export function AIAnalysisSurveySection({
  surveyId,
}: AIAnalysisSurveySectionProps) {
  // Fetch survey data untuk cek apakah ada responden
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && survey.jumlah_responden > 0;

  // Fetch responses untuk trend chart
  const { responSurveis, isLoading: isLoadingResponses } = useResponSurveis(surveyId, {
    limit: 1000,
    enabled: hasRespondents,
  });

  // Fetch analisis kepuasan
  const {
    data: satisfactionData,
    isLoading: isLoadingSatisfaction,
    isError: isErrorSatisfaction,
  } = useSurveySatisfactionAnalysis(surveyId, hasRespondents);

  // Process trend data
  const satisfactionTrendData = satisfactionData && responSurveis
    ? processSatisfactionTrend(responSurveis, satisfactionData)
    : undefined;

  const isLoading = isLoadingSatisfaction || isLoadingResponses;

  // Generate conclusion from real data
  const conclusion = satisfactionData
    ? (() => {
        const satisfiedPct = satisfactionData.satisfaction_percentage.satisfied;
        const majorPref = satisfactionData.major_preference;
        const avgSatisfaction = (satisfactionData.average_satisfaction * 100).toFixed(1);
        
        let conclusionText = `Most respondents are ${satisfiedPct >= 50 ? 'satisfied' : 'neutral'} (${satisfiedPct.toFixed(1)}%), `;
        
        if (majorPref) {
          conclusionText += `with a dominant preference for ${majorPref.name} (${majorPref.percentage.toFixed(1)}%). `;
        }
        
        conclusionText += `The average satisfaction score is ${avgSatisfaction}%. `;
        
        if (satisfactionTrendData && satisfactionTrendData.length > 1) {
          const trend = satisfactionTrendData[satisfactionTrendData.length - 1].satisfaction - satisfactionTrendData[0].satisfaction;
          if (trend > 0) {
            conclusionText += `The satisfaction trend shows steady growth (${trend.toFixed(1)}% increase), indicating positive product improvements and user experience enhancements.`;
          } else if (trend < 0) {
            conclusionText += `The satisfaction trend shows a decline (${Math.abs(trend).toFixed(1)}% decrease), which may require attention to product improvements.`;
          } else {
            conclusionText += `The satisfaction trend remains stable, indicating consistent user experience.`;
          }
        }
        
        return conclusionText;
      })()
    : "AI-generated classification and preference analysis will be available once the survey has completed responses.";

  return (
    <div className="bg-[var(--glass-bg)] rounded-xl shadow-lg border border-border p-6 space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">
          Satisfaction & Preference Overview
        </h2>
        <p className="text-muted-foreground">
          AI-generated classification and preference analysis
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-background rounded-lg p-5 shadow-sm border border-border flex flex-col">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Distribution of respondent satisfaction levels
          </h4>
          <div className="flex-1 min-h-[400px]">
            <ClassificationChart
              satisfactionPercentage={satisfactionData?.satisfaction_percentage}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="bg-background rounded-lg p-5 shadow-sm border border-border flex flex-col">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Distribution by preference category
          </h4>
          <div className="flex-1 min-h-[400px]">
            <PreferencesChart
              preferences={satisfactionData?.preferences}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="bg-background rounded-lg p-5 shadow-sm border border-border flex flex-col">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Satisfaction trend over time
          </h4>
          <div className="flex-1 min-h-[400px]">
            <SatisfactionTrendChart
              data={satisfactionTrendData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Conclusion Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong>Conclusion:</strong> {conclusion}
          </div>
        </div>
      </div>
    </div>
  );
}
