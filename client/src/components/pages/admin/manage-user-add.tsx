'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormAddUmum } from "@/features/user/components/data-umum/form-add";
import { Plus, Users } from "lucide-react";

export function ManageUserAddPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">User Data - Add Public</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Public', href: '/admin/manage-user', icon: <Users size={16} /> },
          { label: 'Add Public', icon: <Plus size={16}/> },
        ]}
      />
      <FormAddUmum />
    </section>
  );
}
