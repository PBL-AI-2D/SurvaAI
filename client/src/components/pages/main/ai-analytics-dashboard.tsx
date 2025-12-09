"use client";

import { AIAnalysisSurveySection } from "./ai-analysis-survey-section";
import { AISegmentationSection } from "./ai-segmentation-section";
import { DashboardAnalyticSection } from "./dashboard-analytic-section";
import { SurveyBreadcrumbNav } from "@/components/umum/breadcrumb-survey";
import { NavUmum } from "@/components/umum/nav-umum";
import { Bot, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import { generateAIInsightSummary, type SatisfactionData } from "@/utils/ai-insights";
import { useMemo } from "react";

interface AIAnalyticsDashboardProps {
  surveyId: string;
}

export function AIAnalyticsDashboard({ surveyId }: AIAnalyticsDashboardProps) {
  // Fetch survey data to check if it has respondents
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && (typeof survey.jumlah_responden === 'number' ? survey.jumlah_responden > 0 : Number(survey.jumlah_responden) > 0);
  
  // Fetch satisfaction analysis for AI Insight Summary
  const { data: satisfactionData } = useSurveySatisfactionAnalysis(surveyId, hasRespondents);
  
  // Generate AI Insight Summary
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
      segments: satisfactionData.segments?.map(seg => ({
        segment_id: seg.segment_id,
        satisfaction_percentage: seg.satisfaction_percentage,
        satisfaction_status: seg.satisfaction_status,
        respondent_count: seg.respondent_count,
      })),
    };
    return generateAIInsightSummary(satisfactionDataForInsight);
  }, [satisfactionData]);

  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <div className="font-bold my-4">
          <h1 className="text-3xl md:text-4xl ">
            Overview Survey
          </h1>
          <p className="block text-xs text-foreground/80 italic">
            Survey ID:{' '}
            <span className="not-italic">{surveyId}</span>
          </p>
          <SurveyBreadcrumbNav surveyId={surveyId} />
        </div>
            <div className="bg-[var(--glass-bg)] border border-[var(--border)] rounded-xl p-6 shadow-lg space-y-8 ">
              {/* AI Insight Summary Banner */}
              <div
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
                    <p className="text-sm opacity-90 leading-relaxed">
                      {aiInsightSummary || "Belum ada data survei terbaru untuk dianalisis. Tunggu hingga ada responden yang menyelesaikan survei."}
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
