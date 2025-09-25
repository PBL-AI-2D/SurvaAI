'use client';

import DataTableSurvey from "@/features/survey/components/admin/data-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export function ManageSurveyPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-4">
      <h1 className="text-3xl font-bold">Survey Data - Survey</h1>

      <Link
        href="/admin/manage-survey/add"
        className="flex items-center justify-center w-[160px] h-[30px] text-center text-sm font-semibold px-4 py-2 gap-2 rounded-md shadow-sm border border-glass-border bg-glass-bg bg-background text-foreground backdrop-blur-md hover:bg-background/80 hover:text-foreground transition-all"
        style={{
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <Plus size={20} />
        Add Survey
      </Link>

      <DataTableSurvey />
    </section>
  );
}
