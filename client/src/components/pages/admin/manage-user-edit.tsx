'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormEditUmum } from "@/features/user/components/data-umum/form-edit";
import { Pencil, Users } from "lucide-react";

interface ManageUserEditPageProps {
  userId: string;
}

export function ManageUserEditPage({ userId }: ManageUserEditPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">User Data - Edit Public</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Public', href: '/admin/manage-user', icon: <Users size={16} /> },
          { label: 'Edit Public', icon: <Pencil size={16}/> },
        ]}
      />
      <FormEditUmum userId={userId} />
    </section>
  );
}
