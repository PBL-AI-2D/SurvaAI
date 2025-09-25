'use client';

import DataTableRewardExchange from "@/features/reward-exchange/components/admin/data-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export function ManageRewardExchangePage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-4">
      <h1 className="text-3xl font-bold">Reward Data - Exchange</h1>

      <Link
        href="/admin/manage-exchange/add"
        className="flex items-center justify-center w-[180px] h-[30px] text-center text-sm font-semibold px-4 py-2 gap-2 rounded-md shadow-sm border border-glass-border bg-glass-bg bg-background text-foreground backdrop-blur-md hover:bg-background/80 hover:text-foreground transition-all"
        style={{
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <Plus size={20} />
        Add Exchange
      </Link>

      <DataTableRewardExchange />
    </section>
  );
}
