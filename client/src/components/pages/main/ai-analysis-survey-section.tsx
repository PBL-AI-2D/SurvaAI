"use client";

import { Lightbulb } from "lucide-react";
import { ClassificationChart } from "./charts/classification-chart";
import { PreferencesChart } from "./charts/preferences-chart";
import { SatisfactionTrendChart } from "./charts/satisfaction-trend-chart";

interface AIAnalysisSurveySectionProps {
  readonly surveyId: string;
}

export function AIAnalysisSurveySection({
  surveyId,
}: AIAnalysisSurveySectionProps) {
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
        <div className="bg-background rounded-lg p-5 shadow-sm border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Distribution of respondent satisfaction levels
          </h4>
          <div className="h-64">
            <ClassificationChart />
          </div>
        </div>

        <div className="bg-background rounded-lg p-5 shadow-sm border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Distribution by preference category
          </h4>
          <div className="h-64">
            <PreferencesChart />
          </div>
        </div>

        <div className="bg-background rounded-lg p-5 shadow-sm border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Prediction over time
          </h4>
          <div className="h-64">
            <SatisfactionTrendChart />
          </div>
        </div>
      </div>

      {/* Conclusion Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong>Conclusion:</strong> Most respondents are satisfied (68%),
            with a dominant preference for Product X (45%). The satisfaction
            trend shows steady growth, indicating positive product improvements
            and user experience enhancements.
          </div>
        </div>
      </div>
    </div>
  );
}
