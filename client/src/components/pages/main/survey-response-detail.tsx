'use client'

import { SurveyBreadcrumbNav } from "@/components/umum/breadcrumb-survey";
import { NavUmum } from "@/components/umum/nav-umum";
import { ResponseDetail } from "@/features/survey-response-result/components/response-detail";

interface SurveyResponsePageProps {
  surveyId: string;
  responSurveyId: string;
}

export function SurveyResponseDetailPage({ surveyId, responSurveyId }: SurveyResponsePageProps) {
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <div className="font-bold my-4">
          <h1 className="text-3xl md:text-4xl ">
            Response Survey
          </h1>
          <p className="block text-xs text-foreground/80 italic">
            Response Survey ID:{' '}
            <span className="not-italic">{responSurveyId}</span>
          </p>
          <SurveyBreadcrumbNav surveyId={surveyId} />
        </div>

        <ResponseDetail surveyId={surveyId} responSurveyId={responSurveyId} />
      </section>
    </main>
  );
}
