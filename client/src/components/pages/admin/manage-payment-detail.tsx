'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormDetailSurveyPayment } from "@/features/survey-payment/components/admin/form-detail";
import { ClipboardList, Eye } from "lucide-react";

interface ManagePaymentDetailPageProps {
  paymentId: string;
}

export function ManagePaymentDetailPage({ paymentId }: ManagePaymentDetailPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Survey Data - Review Verification</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Payments', href: '/admin/manage-payment', icon: <ClipboardList size={16} /> },
          { label: 'Detail Payments', icon: <Eye size={16}/> },
        ]}
      />
      <FormDetailSurveyPayment paymentId={paymentId} />
    </section>
  );
}
