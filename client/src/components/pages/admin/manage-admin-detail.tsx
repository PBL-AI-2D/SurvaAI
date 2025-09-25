'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormDetailAdmin } from "@/features/user/components/data-admin/form-detail";
import { Eye, Users } from "lucide-react";

interface ManageAdminDetailPageProps {
  userId: string;
}

export function ManageAdminDetailPage({ userId }: ManageAdminDetailPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">User Data - Detail Admin</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Admin', href: '/admin/manage-admin', icon: <Users size={16} /> },
          { label: 'Detail Admin', icon: <Eye size={16}/> },
        ]}
      />
      <FormDetailAdmin userId={userId} />
    </section>
  );
}
