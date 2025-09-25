'use client';

import DataTableSurveyPayment from "@/features/survey-payment/components/admin/data-table";

export function ManagePaymentPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-4">
      <h1 className="text-3xl font-bold">Survey Data - Payment</h1>

      <DataTableSurveyPayment />
    </section>
  );
}
