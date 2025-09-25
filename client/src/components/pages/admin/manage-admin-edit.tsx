'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormEditAdmin } from "@/features/user/components/data-admin/form-edit";
import { Pencil, Users } from "lucide-react";

interface ManageAdminEditPageProps {
  userId: string;
}

export function ManageAdminEditPage({ userId }: ManageAdminEditPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">User Data - Edit Admin</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Admin', href: '/admin/manage-admin', icon: <Users size={16} /> },
          { label: 'Edit Admin', icon: <Pencil size={16}/> },
        ]}
      />
      <FormEditAdmin userId={userId} />
    </section>
  );
}
