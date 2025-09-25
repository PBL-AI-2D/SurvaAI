'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormAddSurvey } from "@/features/survey/components/admin/form-add";
import { ClipboardList, Plus } from "lucide-react";

export function ManageSurveyAddPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Survey Data - Add Survey</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Survey', href: '/admin/manage-survey', icon: <ClipboardList size={16} /> },
          { label: 'Add Survey', icon: <Plus size={16}/> },
        ]}
      />
      <FormAddSurvey />
    </section>
  );
}
