'use client';

import { NavUmum } from "@/components/umum/nav-umum";
import PointField from "@/features/profile/components/points-field";
import { RewardList } from "@/features/reward/components/public/reward-list";
import { useState } from "react";

export function ExchangePage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold my-4">
          Point Exchange
        </h1>

        <div className="mb-6">
          <PointField />
        </div>

        <RewardList 
          page={page}
          limit={limit}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}
