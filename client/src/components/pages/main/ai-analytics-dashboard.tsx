"use client";

import { AIAnalysisSurveySection } from "./ai-analysis-survey-section";
import { AISegmentationSection } from "./ai-segmentation-section";
import { DashboardAnalyticSection } from "./dashboard-analytic-section";
import { SurveyBreadcrumbNav } from "@/components/umum/breadcrumb-survey";
import { NavUmum } from "@/components/umum/nav-umum";
import { Bot, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAnalyticsDashboardProps {
  surveyId: string;
}

export function AIAnalyticsDashboard({ surveyId }: AIAnalyticsDashboardProps) {
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
                      68% satisfied, 22% neutral, 10% unsatisfied. Major
                      preference category: Product X (45%). Satisfaction trend
                      shows positive growth with 6% increase over the past 6
                      months. Segment 1 demonstrates highest engagement and
                      satisfaction rates.
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
