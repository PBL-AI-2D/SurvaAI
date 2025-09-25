'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormAddReward } from "@/features/reward/components/admin/form-add";
import { Gift, Plus } from "lucide-react";

export function ManageRewardAddPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Reward Data - Add Reward</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Reward', href: '/admin/manage-reward', icon: <Gift size={16} /> },
          { label: 'Add Reward', icon: <Plus size={16}/> },
        ]}
      />
      <FormAddReward />
    </section>
  );
}
