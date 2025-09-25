'use client';

import DataTableVerification from "@/features/survey-verification/components/admin/data-table";

export function ManageVerificationPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-4">
      <h1 className="text-3xl font-bold">Survey Data - Verification</h1>

      <DataTableVerification />
    </section>
  );
}
