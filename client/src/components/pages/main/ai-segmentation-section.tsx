"use client";

import { Lightbulb, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScatterPlotChart } from "./charts/scatter-plot-chart";
import { SegmentationTable } from "./segmentation-table";
import { FilterDropdowns } from "./filter-dropdowns";

interface AISegmentationSectionProps {
  readonly surveyId: string;
}

export function AISegmentationSection({
  surveyId,
}: AISegmentationSectionProps) {
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
            <ScatterPlotChart />
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
        <SegmentationTable />
      </div>

      {/* AI Summary Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong>AI Summary:</strong> Respondents in Segment 1 (average age
            28) tend to prefer Product X with significantly higher satisfaction
            rates (85%). This segment represents the most engaged and satisfied
            user base. Segment 4 shows lower satisfaction and may require
            targeted improvements.
          </div>
        </div>
      </div>
    </div>
  );
}
