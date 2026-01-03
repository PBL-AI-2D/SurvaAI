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
    ? processSatisfactionTrend(responSurveis, satisfactionData as any)
    : undefined;

  const isLoading = isLoadingSatisfaction || isLoadingResponses;

  // Cast query data to any to avoid strict typing mismatches from react-query generics
  const satisfactionDataAny = satisfactionData as any;

  // Determine which source to use for classification chart percentages.
  // Prefer IKG distribution from backend (counts) and convert to percentages.
  let classificationPercentages = satisfactionData?.satisfaction_percentage;
  if (satisfactionDataAny?.distribution_combined_satisfaction && satisfactionDataAny.total_respondents > 0) {
    const d = satisfactionDataAny.distribution_combined_satisfaction;
    const total = Number(satisfactionDataAny.total_respondents || 0);
    classificationPercentages = {
      satisfied: (Number(d.puas || 0) / total) * 100,
      neutral: (Number(d.netral || 0) / total) * 100,
      unsatisfied: (Number(d.tidak_puas || 0) / total) * 100,
    };
  }

  // Generate conclusion sesuai tema Satisfaction & Preference Overview menggunakan IKG dan explainability
  const conclusion = satisfactionDataAny
    ? (() => {
        const totalRespondents = satisfactionDataAny.total_respondents;
        const ikgIndex = satisfactionDataAny.combined_satisfaction_index;
        const ikgLabel = satisfactionDataAny.combined_satisfaction_label;
        const ikgDist = satisfactionDataAny.distribution_combined_satisfaction;
        const majorPref = satisfactionDataAny.major_preference;
        const weightMetadata = satisfactionDataAny.weight_metadata;
        
        // Gunakan IKG distribution jika tersedia, fallback ke satisfaction_percentage lama
        let satisfiedPct: number;
        let neutralPct: number;
        let unsatisfiedPct: number;
        
        if (ikgDist && totalRespondents > 0) {
          satisfiedPct = (ikgDist.puas / totalRespondents) * 100;
          neutralPct = (ikgDist.netral / totalRespondents) * 100;
          unsatisfiedPct = (ikgDist.tidak_puas / totalRespondents) * 100;
        } else {
          satisfiedPct = satisfactionData.satisfaction_percentage.satisfied;
          neutralPct = satisfactionData.satisfaction_percentage.neutral;
          unsatisfiedPct = satisfactionData.satisfaction_percentage.unsatisfied;
        }
        
        // Theme: Satisfaction & Preference Overview - focus on IKG dan explainability
        let conclusionText = "";
        
        if (ikgIndex !== undefined) {
          const ikgLabelText = ikgLabel ? ` (${ikgLabel})` : "";
          conclusionText = `Based on ${totalRespondents} completed responses, the Combined Satisfaction Index (IKG) is ${ikgIndex.toFixed(1)}%${ikgLabelText}. `;
          conclusionText += `The satisfaction distribution based on IKG shows ${satisfiedPct.toFixed(1)}% satisfied`;
          if (neutralPct > 0) {
            conclusionText += `, ${neutralPct.toFixed(1)}% neutral`;
          }
          conclusionText += `, and ${unsatisfiedPct.toFixed(1)}% unsatisfied. `;
        } else {
          const avgSatisfaction = (satisfactionDataAny.average_satisfaction * 100).toFixed(1);
          conclusionText = `Based on ${totalRespondents} completed responses, the satisfaction distribution shows ${satisfiedPct.toFixed(1)}% satisfied`;
          if (neutralPct > 0) {
            conclusionText += `, ${neutralPct.toFixed(1)}% neutral`;
          }
          conclusionText += `, and ${unsatisfiedPct.toFixed(1)}% unsatisfied. `;
          conclusionText += `The average satisfaction score is ${avgSatisfaction}%. `;
        }
        
        // Tambahkan explanation tentang dynamic weighting jika ada
        if (weightMetadata && weightMetadata.method === "dynamic") {
          conclusionText += `The analysis uses dynamic weighting that adapts to data availability: ${weightMetadata.likert_availability} Likert responses, ${weightMetadata.sentiment_availability} sentiment data, and ${weightMetadata.preference_availability} preference data were considered. `;
        }
        
        if (majorPref) {
          conclusionText += `The most preferred category or feature is ${majorPref.name} (${majorPref.percentage.toFixed(1)}% of respondents). `;
        }
        
        // Trend analysis menggunakan IKG jika tersedia
        if (ikgIndex !== undefined) {
          if (satisfiedPct >= 60) {
            conclusionText += `The satisfaction trend shows steady growth (${satisfiedPct.toFixed(1)}% satisfied based on IKG), indicating positive product improvements and user experience enhancements.`;
          } else if (unsatisfiedPct >= 40) {
            conclusionText += `The satisfaction trend shows a decline (${unsatisfiedPct.toFixed(1)}% unsatisfied based on IKG), which may require attention to product improvements.`;
          } else {
            conclusionText += `The satisfaction trend remains stable based on Combined Satisfaction Index, indicating consistent user experience.`;
          }
        } else if (satisfactionTrendData && satisfactionTrendData.length > 1) {
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
              satisfactionPercentage={classificationPercentages}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="bg-background rounded-lg p-5 shadow-sm border border-border flex flex-col">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Preference Overview
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
            Satisfaction Expected Tren
          </h4>
          <div className="flex-1 min-h-[400px]">
            <SatisfactionTrendChart
                data={satisfactionTrendData || []}
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
