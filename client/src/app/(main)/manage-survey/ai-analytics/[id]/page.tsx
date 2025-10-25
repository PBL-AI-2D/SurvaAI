"use client";

import { AIAnalyticsDashboard } from "@/components/pages/main/ai-analytics-dashboard";
import React from "react";

interface AIAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function AIAnalyticsPage({ params }: AIAnalyticsPageProps) {
  return <AIAnalyticsDashboard surveyId={params.id} />;
}
