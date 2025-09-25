'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormDetailReward } from "@/features/reward/components/admin/form-detail";
import { Eye, Gift } from "lucide-react";

interface ManageRewardDetailPageProps {
  rewardId: string;
}

export function ManageRewardDetailPage({ rewardId }: ManageRewardDetailPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Reward Data - Detail Reward</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Reward', href: '/admin/manage-reward', icon: <Gift size={16} /> },
          { label: 'Detail Reward', icon: <Eye size={16}/> },
        ]}
      />
      <FormDetailReward rewardId={rewardId} />
    </section>
  );
}
