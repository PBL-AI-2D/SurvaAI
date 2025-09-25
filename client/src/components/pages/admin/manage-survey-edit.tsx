'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormEditSurvey } from "@/features/survey/components/admin/form-edit";
import { ClipboardList, Pencil } from "lucide-react";

interface ManageSurveyEditPageProps {
  surveyId: string;
}

export function ManageSurveyEditPage({ surveyId }: ManageSurveyEditPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Survey Data - Edit Survey</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Survey', href: '/admin/manage-survey', icon: <ClipboardList size={16} /> },
          { label: 'Edit Survey', icon: <Pencil size={16}/> },
        ]}
      />
      <FormEditSurvey surveyId={surveyId} />
    </section>
  );
}
