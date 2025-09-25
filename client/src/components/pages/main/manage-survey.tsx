'use client'

import { NavUmum } from "@/components/umum/nav-umum";
import { UserSurveyList } from '@/features/survey/components/user/user-survey-list';
import { useState } from "react";

export function ManageSurveyPage() {
  const [page, setPage] = useState(1);
  const limit = 8;
  
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold my-4">
          Manage Survey
        </h1>

        <UserSurveyList
          page={page}
          limit={limit}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}