"use client";

import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { SummaryCards } from "./summary-cards";
import { SatisfactionAnalysisCard } from "@/features/survey/components/user/satisfaction-analysis-card";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import { useResponSurveis } from "@/features/survey-response-result/hooks/useUserSurveyResponseresult";

interface DashboardAnalyticSectionProps {
  surveyId: string;
}

export function DashboardAnalyticSection({
  surveyId,
}: DashboardAnalyticSectionProps) {
  // Fetch survey data to check if it has respondents
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && survey.jumlah_responden > 0;

  // Fetch responses for chart data
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

  const isLoading = isLoadingSatisfaction || isLoadingResponses;

  // Generate conclusion according to Dashboard Analytic Overview theme
  const conclusionText = useMemo(() => {
    if (!satisfactionData) {
      return "AI model analysis will be available once the survey has completed responses.";
    }

    const satisfiedPct = satisfactionData.satisfaction_percentage.satisfied;
    const unsatisfiedPct = satisfactionData.satisfaction_percentage.unsatisfied;
    const avgSatisfaction = (satisfactionData.average_satisfaction * 100).toFixed(1);
    const totalRespondents = satisfactionData.total_respondents;
    const activeSegments = satisfactionData.segments?.length || 0;
    const bestSegment = satisfactionData.segments && satisfactionData.segments.length > 0
      ? (() => {
          const sorted = [...satisfactionData.segments].sort((a, b) => b.satisfaction_percentage - a.satisfaction_percentage);
          return sorted[0].segment_name || `Segment ${sorted[0].segment_id}`;
        })()
      : null;
    const majorPref = satisfactionData.major_preference;

    // Tema: Dashboard Analytic Overview - fokus pada metrics dan analytics
    let conclusion = `AI model analysis based on ${totalRespondents} completed responses shows an average satisfaction of ${avgSatisfaction}%. `;
    
    if (bestSegment) {
      const bestSegmentData = satisfactionData.segments?.find(s => 
        (s.segment_name || `Segment ${s.segment_id}`) === bestSegment
      );
      if (bestSegmentData) {
        conclusion += `${bestSegment} shows the highest satisfaction at ${bestSegmentData.satisfaction_percentage.toFixed(1)}%. `;
      }
    }

    // Trend prediction
    if (satisfiedPct >= 60) {
      conclusion += `The satisfaction trend is positive with ${satisfiedPct.toFixed(1)}% satisfied responses. `;
    } else if (satisfiedPct < 40) {
      conclusion += `The satisfaction trend indicates concerns with ${unsatisfiedPct.toFixed(1)}% unsatisfied responses. `;
    } else {
      conclusion += `The satisfaction trend is stable with balanced responses. `;
    }

    if (majorPref) {
      conclusion += `Major preference: ${majorPref.name} (${majorPref.percentage.toFixed(1)}% of respondents). `;
    }

    conclusion += `A total of ${activeSegments} active segment${activeSegments > 1 ? 's were' : ' was'} identified through AI clustering analysis.`;

    return conclusion;
  }, [satisfactionData]);

  return (
    <div className="bg-[var(--glass-bg)] rounded-xl shadow-lg border border-border p-6 space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">
          Dashboard Analytic Overview
        </h2>
        <p className="text-muted-foreground">
          Comprehensive metrics and predictive analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div>
        <SummaryCards 
          satisfactionData={satisfactionData}
          totalResponses={responSurveis?.length || 0}
          isLoading={isLoading}
        />
      </div>

      {/* Satisfaction Analysis Section */}
      {hasRespondents && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-xl">
            Satisfaction Analysis
          </h3>
          <SatisfactionAnalysisCard
            surveiId={surveyId}
            analysisData={satisfactionData}
            isLoading={isLoadingSatisfaction}
            isError={isErrorSatisfaction}
          />
        </div>
      )}


      {/* Conclusion Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm" style={{ color: "#1F2937", fontWeight: 400 }}>
            <strong style={{ color: "#111827", fontWeight: 600 }}>Conclusion:</strong> {conclusionText}
          </div>
        </div>
      </div>
    </div>
  );
}
