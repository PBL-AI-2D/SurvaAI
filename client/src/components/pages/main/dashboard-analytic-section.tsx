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

  // Process chart data
  const timePatternData = useMemo(() => {
    if (!responSurveis || responSurveis.length === 0) return undefined;
    return processResponseTimePattern(responSurveis);
  }, [responSurveis]);

  const satisfactionTrendData = useMemo(() => {
    if (!responSurveis || responSurveis.length === 0) return undefined;
    return processSatisfactionTrend(responSurveis, satisfactionData);
  }, [responSurveis, satisfactionData]);

  const conclusionText = useMemo(() => {
    return generateConclusion(satisfactionData, responSurveis, timePatternData);
  }, [satisfactionData, responSurveis, timePatternData]);

  const isLoading = isLoadingSatisfaction || isLoadingResponses;

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // TODO: Apply filters to actual data when data fetching is implemented
    console.log("Filters changed:", newFilters);
  };

  // Memoized filtered data (placeholder - replace with actual data filtering when data is available)
  const filteredData = useMemo(() => {
    // This is a placeholder - when real data is available, filter it here based on filters state
    return {
      isFiltered: filters.gender !== "all" || 
                  filters.ageRange !== "all" || 
                  filters.satisfaction !== "all" || 
                  filters.satisfactionLevel !== "all",
    };
  }, [filters]);

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
        {filteredData.isFiltered && (
          <p className="text-sm text-muted-foreground italic">
            Filters applied: {Object.entries(filters)
              .filter(([_, value]) => value !== "all")
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ") || "None"}
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
            satisfactionData={satisfactionData}
            totalResponses={responSurveis?.length || 0}
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
            analysisData={satisfactionData}
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
