"use client";

import { useState, useMemo } from "react";
import { Lightbulb, BarChart3, TrendingUp, Users, Star } from "lucide-react";
import { SummaryCards } from "./summary-cards";
import { RespondentPatternChart } from "./charts/respondent-pattern-chart";
import { SatisfactionTrendChart } from "./charts/satisfaction-trend-chart";
import { FilterDropdowns, FilterValues } from "./filter-dropdowns";
import { SatisfactionAnalysisCard } from "@/features/survey/components/user/satisfaction-analysis-card";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import { useResponSurveis } from "@/features/survey-response-result/hooks/useUserSurveyResponseresult";
import { 
  processResponseTimePattern, 
  processSatisfactionTrend,
  generateConclusion 
} from "@/features/survey/utils/chart-data-processor";

interface DashboardAnalyticSectionProps {
  surveyId: string;
}

export function DashboardAnalyticSection({
  surveyId,
}: DashboardAnalyticSectionProps) {
  const [filters, setFilters] = useState<FilterValues>({
    gender: "all",
    ageRange: "all",
    satisfaction: "all",
    satisfactionLevel: "all",
  });

  // Fetch survey data untuk cek apakah ada responden
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && survey.jumlah_responden > 0;

  // Fetch responses untuk chart data
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

  const isLoading = isLoadingSatisfaction || isLoadingResponses;

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // Check if filters are active
  const isFiltered = useMemo(() => {
    return filters.gender !== "all" || 
           filters.ageRange !== "all" || 
           filters.satisfaction !== "all" || 
           filters.satisfactionLevel !== "all";
  }, [filters]);

  // Filter segments berdasarkan filter yang dipilih
  const filteredSegments = useMemo(() => {
    if (!satisfactionData?.segments) return [];
    
    return satisfactionData.segments.filter((segment) => {
      // Filter berdasarkan satisfaction level
      if (filters.satisfactionLevel !== "all") {
        if (segment.satisfaction_status !== filters.satisfactionLevel) {
          return false;
        }
      }

      // Filter berdasarkan satisfaction percentage range
      if (filters.satisfaction !== "all") {
        const satisfaction = segment.satisfaction_percentage;
        switch (filters.satisfaction) {
          case "very-satisfied":
            if (satisfaction < 90) return false;
            break;
          case "satisfied":
            if (satisfaction < 70 || satisfaction >= 90) return false;
            break;
          case "neutral":
            if (satisfaction < 50 || satisfaction >= 70) return false;
            break;
          case "dissatisfied":
            if (satisfaction < 30 || satisfaction >= 50) return false;
            break;
          case "very-dissatisfied":
            if (satisfaction >= 30) return false;
            break;
        }
      }

      // Filter berdasarkan age range (jika ada avg_age)
      if (filters.ageRange !== "all" && segment.avg_age) {
        const age = segment.avg_age;
        switch (filters.ageRange) {
          case "18-25":
            if (age < 18 || age > 25) return false;
            break;
          case "26-35":
            if (age < 26 || age > 35) return false;
            break;
          case "36-45":
            if (age < 36 || age > 45) return false;
            break;
          case "46-55":
            if (age < 46 || age > 55) return false;
            break;
          case "55+":
            if (age < 55) return false;
            break;
        }
      }

      return true;
    });
  }, [satisfactionData?.segments, filters]);

  // Hitung metrics dari filtered segments
  const filteredMetrics = useMemo(() => {
    if (!filteredSegments.length) {
      return {
        totalRespondents: 0,
        avgSatisfaction: 0,
        satisfiedPct: 0,
        activeSegments: 0,
      };
    }

    const totalRespondents = filteredSegments.reduce((sum, seg) => sum + seg.respondent_count, 0);
    const totalSatisfaction = filteredSegments.reduce(
      (sum, seg) => sum + (seg.satisfaction_percentage * seg.respondent_count),
      0
    );
    const avgSatisfaction = totalRespondents > 0 ? totalSatisfaction / totalRespondents : 0;
    
    const satisfiedCount = filteredSegments.reduce(
      (sum, seg) => sum + (seg.satisfaction_status === "high" ? seg.respondent_count : 0),
      0
    );
    const satisfiedPct = totalRespondents > 0 ? (satisfiedCount / totalRespondents) * 100 : 0;

    return {
      totalRespondents,
      avgSatisfaction,
      satisfiedPct,
      activeSegments: filteredSegments.length,
    };
  }, [filteredSegments]);

  // Create filtered satisfaction data untuk chart dan conclusion
  const filteredSatisfactionData = useMemo(() => {
    if (!isFiltered || !satisfactionData) return satisfactionData;
    
    return {
      ...satisfactionData,
      segments: filteredSegments,
      total_respondents: filteredMetrics.totalRespondents,
      average_satisfaction: filteredMetrics.avgSatisfaction / 10,
      satisfaction_percentage: {
        satisfied: filteredMetrics.satisfiedPct,
        neutral: 0,
        unsatisfied: 100 - filteredMetrics.satisfiedPct,
      },
    };
  }, [satisfactionData, filteredSegments, filteredMetrics, isFiltered]);

  // Process chart data
  const timePatternData = useMemo(() => {
    if (!responSurveis || responSurveis.length === 0) return undefined;
    return processResponseTimePattern(responSurveis);
  }, [responSurveis]);

  const satisfactionTrendData = useMemo(() => {
    if (!responSurveis || responSurveis.length === 0) return undefined;
    return processSatisfactionTrend(responSurveis, filteredSatisfactionData);
  }, [responSurveis, filteredSatisfactionData]);

  const conclusionText = useMemo(() => {
    return generateConclusion(filteredSatisfactionData, responSurveis, timePatternData);
  }, [filteredSatisfactionData, responSurveis, timePatternData]);

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
        {isFiltered && (
          <p className="text-sm text-muted-foreground italic">
            Filters applied: {Object.entries(filters)
              .filter(([_, value]) => value !== "all")
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ") || "None"}
            {filteredSegments.length !== satisfactionData?.segments?.length && (
              <span className="ml-2">
                ({filteredSegments.length} of {satisfactionData?.segments?.length || 0} segments shown)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Filters and Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <div className="bg-muted rounded-lg p-4 border border-border">
            <FilterDropdowns onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="lg:col-span-3">
          <SummaryCards 
            satisfactionData={filteredSatisfactionData}
            totalResponses={isFiltered ? filteredMetrics.totalRespondents : responSurveis?.length || 0}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Satisfaction Analysis Section */}
      {hasRespondents && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-xl">
            Satisfaction Analysis
          </h3>
          <SatisfactionAnalysisCard
            surveiId={surveyId}
            analysisData={filteredSatisfactionData}
            isLoading={isLoadingSatisfaction}
            isError={isErrorSatisfaction}
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Pattern Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Responses by time of day
          </h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            <RespondentPatternChart 
              data={timePatternData}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Satisfaction Trend Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Satisfaction Trend (Weekly)
          </h3>
          <div className="bg-background rounded-lg p-4 border border-border">
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
            <strong>Conclusion:</strong> {conclusionText}
          </div>
        </div>
      </div>
    </div>
  );
}
