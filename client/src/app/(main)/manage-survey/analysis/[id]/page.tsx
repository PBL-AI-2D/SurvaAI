import type { Metadata } from "next";
import { AnalysisSurveyPage } from "@/components/pages/main/analysis-survey";

type Props = { params: { id: string } };

// Server-only: OK untuk generateMetadata
export function generateMetadata({ params }: Props): Metadata {
  const shortId = params.id.slice(0, 8);
  return {
    title: `Surva. - Analysis Survey #${shortId}`,
  };
}

// Page tetap server; komponen di dalamnya boleh "use client"
export default function Page({ params }: Props) {
  return <AnalysisSurveyPage surveyId={params.id} />;
}
