'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormDetailRewardExchange } from "@/features/reward-exchange/components/admin/form-detail";
import { Eye, Gift } from "lucide-react";

interface ManageRewardExchangeDetailPageProps {
  rewardExchangeId: string;
}

export function ManageRewardExchangeDetailPage({ rewardExchangeId }: ManageRewardExchangeDetailPageProps) {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Reward Data - Detail Exchange</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Exchange', href: '/admin/manage-exchange', icon: <Gift size={16} /> },
          { label: 'Detail Exchange', icon: <Eye size={16}/> },
        ]}
      />
      <FormDetailRewardExchange rewardExchangeId={rewardExchangeId} />
    </section>
  );
}
