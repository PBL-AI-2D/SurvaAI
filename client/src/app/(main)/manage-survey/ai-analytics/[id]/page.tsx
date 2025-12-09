"use client";

import { AIAnalyticsDashboard } from "@/components/pages/main/ai-analytics-dashboard";
import React, { use } from "react";

interface AIAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AIAnalyticsPage({ params }: AIAnalyticsPageProps) {
  const { id } = use(params);
  return <AIAnalyticsDashboard surveyId={id} />;
}
