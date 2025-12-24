"use client";

import { AIAnalysisSurveySection } from "./ai-analysis-survey-section";
import { AISegmentationSection } from "./ai-segmentation-section";
import { DashboardAnalyticSection } from "./dashboard-analytic-section";

import { SurveyBreadcrumbNav } from "@/components/umum/breadcrumb-survey";
import { NavUmum } from "@/components/umum/nav-umum";
import { Bot, Download, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import {
  generateAIInsightSummary,
  type SatisfactionData,
} from "@/utils/ai-insights";
import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AIAnalyticsDashboardProps {
  surveyId: string;
}

export function AIAnalyticsDashboard({ surveyId }: AIAnalyticsDashboardProps) {
  const router = useRouter();

  // Fetch survey data to check if it has respondents
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents =
    survey &&
    (typeof survey.jumlah_responden === "number"
      ? survey.jumlah_responden > 0
      : Number(survey.jumlah_responden) > 0);

  // Fetch satisfaction analysis for AI Insight Summary
  const {
    data: satisfactionData,
    isLoading: isLoadingSatisfaction,
    isError: isErrorSatisfaction,
  } = useSurveySatisfactionAnalysis(surveyId, hasRespondents);
  
  // Check if data is insufficient
  const isDataInsufficient = satisfactionData?.data_insufficient || false;

  // Generate AI Insight Summary dari recommendation_service
  const aiInsightSummary = useMemo(() => {
    if (!satisfactionData) {
      return null;
    }
    const satisfactionDataForInsight: SatisfactionData = {
      satisfied: satisfactionData.satisfaction_percentage.satisfied,
      neutral: satisfactionData.satisfaction_percentage.neutral,
      unsatisfied: satisfactionData.satisfaction_percentage.unsatisfied,
      total_respondents: satisfactionData.total_respondents,
      major_preference: satisfactionData.major_preference,
      segments: satisfactionData.segments?.map((seg) => ({
        segment_id: seg.segment_id,
        satisfaction_percentage: seg.satisfaction_percentage,
        satisfaction_status: seg.satisfaction_status,
        respondent_count: seg.respondent_count,
      })),
      // PRIORITAS: Include segment_insights dari recommendation_service
      segment_insights: satisfactionData.segment_insights?.map((insight) => ({
        segment_id: insight.segment_id,
        problem: insight.problem,
        cause: insight.cause,
        recommendation: insight.recommendation,
        summary: insight.summary,
        satisfaction_status: insight.satisfaction_status,
        confidence: insight.confidence,
        confidence_label: insight.confidence_label,
        reason: insight.reason,
        explainability: insight.explainability,
        low_confidence_warning: insight.low_confidence_warning,
      })),
    };
    return generateAIInsightSummary(satisfactionDataForInsight);
  }, [satisfactionData]);

  // Download report as structured PDF using jsPDF (berisi ringkasan analisis)
  const handleDownloadPdf = useCallback(async () => {
    if (typeof window === "undefined") return;

    const jsPDFModule = await import("jspdf");
    const JsPDF = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;

    const pdf = new JsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    let y = 20;

    // Title
    pdf.setFontSize(18);
    pdf.text("Survey Overview Report", pageWidth / 2, y, { align: "center" });
    y += 10;

    pdf.setFontSize(11);
    pdf.text(`Survey ID: ${surveyId}`, 14, y);
    y += 8;

    // AI Insight Summary
    if (aiInsightSummary) {
      pdf.setFontSize(13);
      pdf.text("AI Insight Summary", 14, y);
      y += 6;

      pdf.setFontSize(10);
      const insightLines = pdf.splitTextToSize(
        aiInsightSummary,
        pageWidth - 28
      );
      pdf.text(insightLines, 14, y);
      y += insightLines.length * 5 + 4;
    }

    // Satisfaction overview
    if (satisfactionData) {
      pdf.setFontSize(13);
      pdf.text("Satisfaction & Preference Overview", 14, y);
      y += 6;

      pdf.setFontSize(10);
      pdf.text(
        `Total respondents: ${satisfactionData.total_respondents}`,
        14,
        y
      );
      y += 5;
      pdf.text(
        `Satisfied: ${satisfactionData.satisfaction_percentage.satisfied.toFixed(
          1
        )}%`,
        14,
        y
      );
      y += 5;
      pdf.text(
        `Neutral: ${satisfactionData.satisfaction_percentage.neutral.toFixed(
          1
        )}%`,
        14,
        y
      );
      y += 5;
      pdf.text(
        `Unsatisfied: ${satisfactionData.satisfaction_percentage.unsatisfied.toFixed(
          1
        )}%`,
        14,
        y
      );
      y += 8;

      if (satisfactionData.major_preference) {
        pdf.text(
          `Major preference: ${satisfactionData.major_preference}`,
          14,
          y
        );
        y += 8;
      }

      // Segmentation overview (ringkas)
      if (satisfactionData.segments && satisfactionData.segments.length > 0) {
        pdf.setFontSize(13);
        pdf.text("AI Respondent Segmentation", 14, y);
        y += 6;

        pdf.setFontSize(10);
        satisfactionData.segments.slice(0, 4).forEach((seg, index) => {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(
            `Segment ${seg.segment_id}: ${
              seg.satisfaction_status
            } - ${seg.satisfaction_percentage.toFixed(1)}% satisfaction (${
              seg.respondent_count
            } respondents)`,
            14,
            y
          );
          y += 5;
        });
        y += 4;
      }

      // Segment-Specific Insights & Recommendations
      if (
        satisfactionData.segment_insights &&
        satisfactionData.segment_insights.length > 0
      ) {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFontSize(13);
        pdf.text("Segment-Specific Insights & Recommendations", 14, y);
        y += 6;

        pdf.setFontSize(10);
        satisfactionData.segment_insights.forEach((insight) => {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }

          // Segment header
          pdf.setFontSize(11);
          pdf.setFont(undefined, "bold");
          pdf.text(`Segment ${insight.segment_id}`, 14, y);
          y += 5;

          pdf.setFontSize(10);
          pdf.setFont(undefined, "normal");

          // Problem
          const problemLines = pdf.splitTextToSize(
            `Problem: ${insight.problem}`,
            pageWidth - 28
          );
          pdf.text(problemLines, 14, y);
          y += problemLines.length * 5 + 2;

          // Cause
          const causeLines = pdf.splitTextToSize(
            `Cause: ${insight.cause}`,
            pageWidth - 28
          );
          pdf.text(causeLines, 14, y);
          y += causeLines.length * 5 + 2;

          // Recommendation
          const recLines = pdf.splitTextToSize(
            `Recommendation: ${insight.recommendation}`,
            pageWidth - 28
          );
          pdf.text(recLines, 14, y);
          y += recLines.length * 5 + 4;
        });
      }
    }

    pdf.save(`survey-report-${surveyId}.pdf`);
  }, [surveyId, aiInsightSummary, satisfactionData]);

  const handleReturnToExplore = useCallback(() => {
    router.push("/explore");
  }, [router]);

  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <div className="font-bold my-4">
          <h1 className="text-3xl md:text-4xl ">Overview Survey</h1>
          <p className="block text-xs text-foreground/80 italic">
            Survey ID: <span className="not-italic">{surveyId}</span>
          </p>
          <SurveyBreadcrumbNav surveyId={surveyId} />
        </div>
        <div className="bg-[var(--glass-bg)] border border-[var(--border)] rounded-xl p-6 shadow-lg space-y-8 ">
          {/* AI Insight Summary Banner */}
          <div
            data-ai-insight-banner
            className="rounded-lg p-4 text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary-1) 0%, var(--color-primary-2) 50%, var(--color-primary-3) 100%)",
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  AI Insight Summary
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#FFFFFF", fontWeight: 400 }}>
                  {aiInsightSummary ||
                    "No latest survey data is available for analysis. Please wait until respondents complete the survey."}
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis Survey Section */}
          <AIAnalysisSurveySection surveyId={surveyId} />

          {/* AI Segmentation Respondent Section */}
          <AISegmentationSection surveyId={surveyId} />

          {/* Dashboard Analytic Overview Section */}
          <DashboardAnalyticSection surveyId={surveyId} />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="text-white"
                onClick={handleDownloadPdf}
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Full Report (PDF)
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleReturnToExplore}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Explore
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Powered by SurvaAnalytics AI Engine - Preference and Sentiment
              Intelligence System
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
