'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { SurveyVerificationContainer } from "@/features/survey-verification/components/admin/survey-verification-container";
import { ClipboardList, SquareChartGantt } from "lucide-react";

interface ManageVerificationReviewPageProps {
  surveyId: string;
}

export function ManageVerificationReviewPage({ surveyId }: ManageVerificationReviewPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Survey Data - Review Verification</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Verification', href: '/admin/manage-verification', icon: <ClipboardList size={16} /> },
          { label: 'Review Verification', icon: <SquareChartGantt size={16}/> },
        ]}
      />
      <SurveyVerificationContainer surveyId={surveyId} />
    </section>
  );
}
