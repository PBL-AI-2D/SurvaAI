"use client";

import type { Metadata } from "next";
import { AnalysisSurveyPage } from "@/components/pages/main/analysis-survey";
import { use } from "react";

type Props = { params: Promise<{ id: string }> };

// Page component
export default function Page({ params }: Props) {
  const { id } = use(params);
  return <AnalysisSurveyPage surveyId={id} />;
}
