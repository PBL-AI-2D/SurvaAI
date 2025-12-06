"use client";

import { Lightbulb, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScatterPlotChart } from "./charts/scatter-plot-chart";
import { SegmentationTable } from "./segmentation-table";
import { FilterDropdowns } from "./filter-dropdowns";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";

interface AISegmentationSectionProps {
  readonly surveyId: string;
}

export function AISegmentationSection({
  surveyId,
}: AISegmentationSectionProps) {
  // Fetch survey data untuk cek apakah ada responden
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && survey.jumlah_responden > 0;

  // Fetch analisis kepuasan untuk segmentation data
  const {
    data: satisfactionData,
    isLoading: isLoadingSatisfaction,
    isError: isErrorSatisfaction,
  } = useSurveySatisfactionAnalysis(surveyId, hasRespondents);

  // Generate AI Summary dari data real
  const aiSummary = satisfactionData?.segments && satisfactionData.segments.length > 0
    ? (() => {
        const highestSegment = satisfactionData.segments.reduce((max, seg) =>
          seg.satisfaction_percentage > max.satisfaction_percentage ? seg : max
        );
        const lowestSegment = satisfactionData.segments.reduce((min, seg) =>
          seg.satisfaction_percentage < min.satisfaction_percentage ? seg : min
        );
        return `Respondents in Segment ${highestSegment.segment_id}${highestSegment.avg_age ? ` (average age ${highestSegment.avg_age})` : ''}${highestSegment.dominant_preference ? ` tend to prefer ${highestSegment.dominant_preference}` : ''} with significantly higher satisfaction rates (${highestSegment.satisfaction_percentage.toFixed(1)}%). This segment represents the most engaged and satisfied user base. Segment ${lowestSegment.segment_id} shows lower satisfaction (${lowestSegment.satisfaction_percentage.toFixed(1)}%) and may require targeted improvements.`;
      })()
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
          Cluster analysis based on satisfaction and preference patterns
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
              pcaData={satisfactionData?.pca_2d}
              segments={satisfactionData?.segments}
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
            <FilterDropdowns />
            <Button
              className="w-full mt-4"
              style={{
                background:
                  "linear-gradient(90deg, var(--primary), var(--primary-2))",
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Segmentation Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">
          Detailed breakdown of each respondent segment
        </h3>
        <SegmentationTable
          segments={satisfactionData?.segments}
          isLoading={isLoadingSatisfaction}
        />
      </div>

      {/* AI Summary Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong>AI Summary:</strong> {aiSummary}
          </div>
        </div>
      </div>
    </div>
  );
}
