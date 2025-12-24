"use client";

import { useState, useMemo } from "react";
import { Lightbulb, Users, Filter } from "lucide-react";
import { ScatterPlotChart } from "./charts/scatter-plot-chart";
import { SegmentationTable } from "./segmentation-table";
import { FilterDropdowns, FilterValues } from "./filter-dropdowns";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import { CustomerSegment } from "@/features/ai-classification/types/types";
import { PCAPoint } from "@/features/ai-classification/types/types";

interface AISegmentationSectionProps {
  readonly surveyId: string;
}

export function AISegmentationSection({
  surveyId,
}: AISegmentationSectionProps) {
  // Fetch survey data to check if it has respondents
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && survey.jumlah_responden > 0;

  // Fetch satisfaction analysis for segmentation data
  const {
    data: satisfactionData,
    isLoading: isLoadingSatisfaction,
    isError: isErrorSatisfaction,
  } = useSurveySatisfactionAnalysis(surveyId, hasRespondents);

  // Filter state
  const [filters, setFilters] = useState<FilterValues>({
    gender: "all",
    ageRange: "all",
    satisfaction: "all",
    satisfactionLevel: "all",
  });

  // Filter segments based on selected filters
  const filteredSegments = useMemo(() => {
    if (!satisfactionData?.segments) return [];
    
    return satisfactionData.segments.filter((segment: CustomerSegment) => {
      // Filter by satisfaction level
      if (filters.satisfactionLevel !== "all") {
        if (segment.satisfaction_status !== filters.satisfactionLevel) {
          return false;
        }
      }

      // Filter by satisfaction percentage range
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

      // Filter by age range (if avg_age is available)
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

  // Filter PCA data based on filtered segments
  const filteredPcaData = useMemo(() => {
    if (!satisfactionData?.pca_2d || !filteredSegments.length) return [];
    
    const filteredSegmentIds = new Set(filteredSegments.map(s => s.segment_id));
    
    return satisfactionData.pca_2d.filter((point: PCAPoint) => 
      filteredSegmentIds.has(point.cluster)
    );
  }, [satisfactionData?.pca_2d, filteredSegments]);

  // Generate AI Summary from real data (using filtered segments)
  const aiSummary = filteredSegments && filteredSegments.length > 0
    ? (() => {
        const highestSegment = filteredSegments.reduce((max, seg) =>
          seg.satisfaction_percentage > max.satisfaction_percentage ? seg : max
        );
        const lowestSegment = filteredSegments.reduce((min, seg) =>
          seg.satisfaction_percentage < min.satisfaction_percentage ? seg : min
        );
        
        const totalSegments = satisfactionData?.segments?.length || 0;
        const isFiltered = filteredSegments.length !== totalSegments;
        
        let summary = `Based on the survey data${isFiltered ? ` (filtered: ${filteredSegments.length} of ${totalSegments} segments)` : ''}, ${filteredSegments.length} distinct respondent segment${filteredSegments.length > 1 ? 's were' : ' was'} identified. `;
        
        // Information about the highest segment (use segment_name if available)
        const highestSegmentName = highestSegment.segment_name || `Segment ${highestSegment.segment_id}`;
        summary += `${highestSegmentName} (${highestSegment.respondent_count} respondents) shows the highest satisfaction at ${highestSegment.satisfaction_percentage.toFixed(1)}%`;
        if (highestSegment.dominant_preference && highestSegment.dominant_preference !== "N/A") {
          summary += `, with a strong preference for "${highestSegment.dominant_preference}"`;
        }
        summary += `. `;
        
        // Information about the lowest segment
        if (lowestSegment.segment_id !== highestSegment.segment_id && filteredSegments.length > 1) {
          const lowestSegmentName = lowestSegment.segment_name || `Segment ${lowestSegment.segment_id}`;
          summary += `${lowestSegmentName} (${lowestSegment.respondent_count} respondents) has lower satisfaction at ${lowestSegment.satisfaction_percentage.toFixed(1)}%`;
          if (lowestSegment.dominant_preference && lowestSegment.dominant_preference !== "N/A") {
            summary += ` and tends toward "${lowestSegment.dominant_preference}"`;
          }
          summary += `. This segment may benefit from targeted improvements to enhance satisfaction.`;
        }
        
        return summary;
      })()
    : satisfactionData?.segments && satisfactionData.segments.length > 0
    ? "No segments match the selected filters. Please adjust your filter criteria."
    : "AI segmentation analysis will be available once survey has completed responses.";

  return (
    <div className="bg-[var(--glass-bg)] rounded-xl shadow-lg border border-border p-6 space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          AI Respondent Segmentation
        </h2>
        <p className="text-muted-foreground">
          Cluster analysis based on satisfaction scores, sentiment scores, and preference patterns. 
          Segments with the same preference may differ due to different satisfaction levels or other preferences.
        </p>
      </div>

      {/* Scatter Plot and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Plot */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground">
            Respondent clustering by satisfaction & preference score
          </h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            <ScatterPlotChart
              pcaData={filteredPcaData}
              segments={filteredSegments}
              isLoading={isLoadingSatisfaction}
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h3>
          <div className="bg-muted rounded-lg p-4 border border-border">
            <FilterDropdowns onFilterChange={setFilters} />
          </div>
        </div>
      </div>

      {/* Segmentation Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">
          Detailed breakdown of each respondent segment
          {filteredSegments.length !== satisfactionData?.segments?.length && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredSegments.length} of {satisfactionData?.segments?.length || 0} segments)
            </span>
          )}
        </h3>
        <SegmentationTable
          segments={filteredSegments}
          isLoading={isLoadingSatisfaction}
        />
      </div>

      {/* AI Summary Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm" style={{ color: "#1F2937", fontWeight: 400 }}>
            <strong style={{ color: "#111827", fontWeight: 600 }}>AI Summary:</strong> {aiSummary}
          </div>
        </div>
      </div>
    </div>
  );
}
