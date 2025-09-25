'use client'

import { SurveyBreadcrumbNav } from "@/components/umum/breadcrumb-survey";
import { NavUmum } from "@/components/umum/nav-umum";
import ResponseList from "@/features/survey-response-result/components/response-list";
import { useState } from "react";

interface SurveyResponsePageProps {
  surveyId: string;
}

export function SurveyResponsesPage({ surveyId }: SurveyResponsePageProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <div className="font-bold my-4">
          <h1 className="text-3xl md:text-4xl ">
            Responses Survey
          </h1>
          <p className="block text-xs text-foreground/80 italic">
            Survey ID:{' '}
            <span className="not-italic">{surveyId}</span>
          </p>
          <SurveyBreadcrumbNav surveyId={surveyId} />
        </div>

        <ResponseList 
          surveiId={surveyId}
          page={page}
          limit={limit}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}
