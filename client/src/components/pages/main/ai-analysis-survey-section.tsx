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
  // Fetch survey data to check if it has respondents
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && (
    typeof survey.jumlah_responden === "number"
      ? survey.jumlah_responden > 0
      : Number(survey.jumlah_responden) > 0
  );

  // Fetch responses for trend chart
  const { responSurveis, isLoading: isLoadingResponses } = useResponSurveis(surveyId, {
    limit: 1000,
    enabled: hasRespondents,
  });

  // Fetch satisfaction analysis
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

  // Generate conclusion sesuai tema Satisfaction & Preference Overview
  const conclusion = satisfactionData
    ? (() => {
        const satisfiedPct = satisfactionData.satisfaction_percentage.satisfied;
        const neutralPct = satisfactionData.satisfaction_percentage.neutral;
        const unsatisfiedPct = satisfactionData.satisfaction_percentage.unsatisfied;
        const majorPref = satisfactionData.major_preference;
        const avgSatisfaction = (satisfactionData.average_satisfaction * 100).toFixed(1);
        const totalRespondents = satisfactionData.total_respondents;
        
        // Theme: Satisfaction & Preference Overview - focus on satisfaction distribution and preferences
        let conclusionText = `Based on ${totalRespondents} completed responses, the satisfaction distribution shows ${satisfiedPct.toFixed(1)}% satisfied`;
        if (neutralPct > 0) {
          conclusionText += `, ${neutralPct.toFixed(1)}% neutral`;
        }
        conclusionText += `, and ${unsatisfiedPct.toFixed(1)}% unsatisfied. `;
        
        conclusionText += `The average satisfaction score is ${avgSatisfaction}%. `;
        
        if (majorPref) {
          conclusionText += `The most preferred category or feature is ${majorPref.name} (${majorPref.percentage.toFixed(1)}% of respondents). `;
        }
        
        // Trend analysis
        if (satisfactionTrendData && satisfactionTrendData.length > 1) {
          const trend = satisfactionTrendData[satisfactionTrendData.length - 1].satisfaction - satisfactionTrendData[0].satisfaction;
          if (trend > 0) {
            conclusionText += `The satisfaction trend shows steady growth (${trend.toFixed(1)}% increase), indicating positive product improvements and user experience enhancements.`;
          } else if (trend < 0) {
            conclusionText += `The satisfaction trend shows a decline (${Math.abs(trend).toFixed(1)}% decrease), which may require attention to product improvements.`;
          } else {
            conclusionText += `The satisfaction trend remains stable, indicating consistent user experience.`;
          }
        } else {
          // Fallback trend based on satisfaction percentage
          if (satisfiedPct >= 60) {
            conclusionText += `The current satisfaction level indicates positive user experience and product acceptance.`;
          } else if (satisfiedPct < 40) {
            conclusionText += `The current satisfaction level indicates areas that need improvement to enhance user experience.`;
          } else {
            conclusionText += `The current satisfaction level shows balanced user experience with room for improvement.`;
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
          <div className="text-sm" style={{ color: "#1F2937", fontWeight: 400 }}>
            <strong style={{ color: "#111827", fontWeight: 600 }}>Conclusion:</strong> {conclusion}
          </div>
        </div>
      </div>
    </div>
  );
}
