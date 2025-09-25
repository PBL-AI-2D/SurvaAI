'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormEditReward } from "@/features/reward/components/admin/form-edit";
import { Gift, Pencil } from "lucide-react";

interface ManageRewardEditPageProps {
  rewardId: string;
}

export function ManageRewardEditPage({ rewardId }: ManageRewardEditPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Reward Data - Edit Reward</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Reward', href: '/admin/manage-reward', icon: <Gift size={16} /> },
          { label: 'Edit Reward', icon: <Pencil size={16}/> },
        ]}
      />
      <FormEditReward rewardId={rewardId} />
    </section>
  );
}
