'use client';

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { FormAddRewardExchange } from "@/features/reward-exchange/components/admin/form-add";
import { Gift, Plus } from "lucide-react";

export function ManageRewardExchangeAddPage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-5 font-semibold">
      <h1 className="text-3xl font-bold">Reward Data - Add Exchange</h1>
      <AdminBreadcrumb
        items={[
          { label: 'Manage Exchange', href: '/admin/manage-exchange', icon: <Gift size={16} /> },
          { label: 'Add Exchange', icon: <Plus size={16}/> },
        ]}
      />
      <FormAddRewardExchange />
    </section>
  );
}
