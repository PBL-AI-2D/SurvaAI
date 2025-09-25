'use client';

import { useState } from 'react';
import { SurveyList } from '@/features/survey/components/public/survey-list';
import { NavUmum } from "@/components/umum/nav-umum";

export function ExplorePage() {
  const [page, setPage] = useState(1);
  // const [search, setSearch] = useState('');
  // const [searchInput, setSearchInput] = useState('');
  const limit = 10;

  // const handleSearch = () => {
  //   setPage(1);
  //   setSearch(searchInput.trim());
  // };

  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold my-4">
          Explore Survey
        </h1>

        {/* <div className="flex flex-row gap-5 mb-6">
          <Input
            type="text"
            placeholder="Cari survei"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="md:max-w-[300px]"
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            className="cursor-pointer hover:bg-primary-2 hover:text-accent-1"
          >
            Cari
          </Button>
        </div> */}

        <SurveyList
          page={page}
          limit={limit}
          // filters={search ? { keyword: search } : {}}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}
