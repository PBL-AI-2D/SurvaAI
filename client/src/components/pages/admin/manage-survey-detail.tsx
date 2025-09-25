'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormDetailSurvey } from "@/features/survey/components/admin/form-detail";
import { ClipboardList, Eye } from "lucide-react";

interface ManageSurveyDetailPageProps {
  surveyId: string;
}

export function ManageSurveyDetailPage({ surveyId }: ManageSurveyDetailPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Survey Data - Detail Survey</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Survey', href: '/admin/manage-survey', icon: <ClipboardList size={16} /> },
          { label: 'Detail Survey', icon: <Eye size={16}/> },
        ]}
      />
      <FormDetailSurvey surveyId={surveyId} />
    </section>
  );
}
