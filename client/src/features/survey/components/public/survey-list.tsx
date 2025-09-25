'use client';

import { usePublishedSurveys } from '../../hooks/usePublishedSurveys';
import { SurveyCard } from './survey-card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/umum/pagination';

interface SurveyListProps {
  page: number;
  limit?: number;
  filters?: Record<string, any>;
  onPageChange: (newPage: number) => void;
}

export function SurveyList({
  page,
  limit = 12,
  filters = {},
  onPageChange,
}: SurveyListProps) {
  const {
    surveys,
    isLoading,
    isError,
    errorMessage,
    refetch,
    meta,
  } = usePublishedSurveys({ page, limit, filters });

  const totalPages = meta?.total_pages ?? 1;

  if (isLoading) {
    return (
      <div className="grid xl:grid-cols-5 md:grid-cols-2 grid-cols-2 xl:gap-5 md:gap-3 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-[280px] rounded-xl bg-glass-bg backdrop-blur-lg border border-glass-border shadow-inner"
            style={{
              background: 'var(--glass-background)',
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex-grow justify-center content-center w-full mx-auto text-center px-6 py-8 rounded-2xl bg-glass-bg backdrop-blur-xl"
      >
        <p className="text-destructive font-medium mb-4">
          {errorMessage || 'Failed to load surveys.'}
        </p>
        <Button
          onClick={() => refetch()}
          className="px-5 py-2 text-sm font-semibold rounded-lg border border-glass-border backdrop-blur-md shadow-md 
            bg-destructive/50 dark:bg-destructive/50 text-foreground hover:bg-destructive/40 dark:hover:bg-destructive/20 transition"
          style={{
            backdropFilter: 'var(--glass-blur)',
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div
        className="flex-grow justify-center content-center w-full mx-auto text-center px-6 py-10 rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md text-muted-foreground"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <p className="text-lg font-medium">No surveys are currently available.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-grow">
        <div className="grid xl:grid-cols-5 grid-cols-2 md:gap-5 gap-3">
          {surveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              surveiId={survey.id}
              judul={survey.judul}
              deskripsi={survey.deskripsi}
              hadiah_poin={survey.hadiah_poin}
              Umum={{
                id: survey.Umum?.id || '',
                nama: survey.Umum?.nama || '[Deleted User]',
                ...survey.Umum,
              }}
              kriteria={survey.kriteria}
              tanggal_mulai={survey.tanggal_mulai}
              tanggal_berakhir={survey.tanggal_berakhir}
            />
          ))}
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
