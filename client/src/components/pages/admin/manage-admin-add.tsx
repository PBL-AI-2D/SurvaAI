'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormAddAdmin } from "@/features/user/components/data-admin/form-add";
import { Plus, Users } from "lucide-react";

export function ManageAdminAddPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">User Data - Add Admin</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Admin', href: '/admin/manage-admin', icon: <Users size={16} /> },
          { label: 'Add Admin', icon: <Plus size={16}/> },
        ]}
      />
      <FormAddAdmin />
    </section>
  );
}
