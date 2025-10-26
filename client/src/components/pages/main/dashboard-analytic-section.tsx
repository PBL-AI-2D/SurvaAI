"use client";

import { Lightbulb, BarChart3, TrendingUp, Users, Star } from "lucide-react";
import { SummaryCards } from "./summary-cards";
import { RespondentPatternChart } from "./charts/respondent-pattern-chart";
import { SatisfactionTrendChart } from "./charts/satisfaction-trend-chart";
import { FilterDropdowns } from "./filter-dropdowns";

interface DashboardAnalyticSectionProps {
  surveyId: string;
}

export function DashboardAnalyticSection({
  surveyId,
}: DashboardAnalyticSectionProps) {
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

      {/* Filters and Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <div className="bg-muted rounded-lg p-4 border border-border">
            <FilterDropdowns />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="lg:col-span-3">
          <SummaryCards />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Pattern Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Responses by time of day
          </h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            <RespondentPatternChart />
          </div>
        </div>

        {/* Satisfaction Trend Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Weekly comparison across products
          </h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            <SatisfactionTrendChart />
          </div>
        </div>
      </div>

      {/* Conclusion Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong>Conclusion:</strong> AI model predicts stable satisfaction
            trends with continued positive momentum. Segment 2 shows highest
            preference consistency for Product X. Response patterns indicate
            peak engagement during afternoon hours (238 responses). Product X
            demonstrates strongest satisfaction growth trajectory across all
            categories.
          </div>
        </div>
      </div>
    </div>
  );
}
