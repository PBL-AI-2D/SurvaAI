'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormDetailUmum } from "@/features/user/components/data-umum/form-detail";
import { Eye, Users } from "lucide-react";

interface ManageUserDetailPageProps {
  userId: string;
}

export function ManageUserDetailPage({ userId }: ManageUserDetailPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">User Data - Detail Public</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Public', href: '/admin/manage-user', icon: <Users size={16} /> },
          { label: 'Detail Public', icon: <Eye size={16}/> },
        ]}
      />
      <FormDetailUmum userId={userId} />
    </section>
  );
}
