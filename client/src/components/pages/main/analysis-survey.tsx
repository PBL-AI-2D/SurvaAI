'use client'

import { SurveyBreadcrumbNav } from "@/components/umum/breadcrumb-survey";
import { NavUmum } from "@/components/umum/nav-umum";
import { AnalysisList } from "@/features/survey-response-result/components/analysis-list";

interface AnalysisSurveyPageProps {
  surveyId: string;
}

export function AnalysisSurveyPage({ surveyId }: AnalysisSurveyPageProps) {
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <div className="font-bold my-4">
          <h1 className="text-3xl md:text-4xl ">
            Analysis Survey
          </h1>
          <p className="block text-xs text-foreground/80 italic">
            Survey ID:{' '}
            <span className="not-italic">{surveyId}</span>
          </p>
          <SurveyBreadcrumbNav surveyId={surveyId} />
        </div>

        <AnalysisList surveyId={surveyId} />
      </section>
    </main>
  );
}
