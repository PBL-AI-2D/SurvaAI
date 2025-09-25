'use client';

import { UserSurveyCard } from './user-survey-card';
import { useUserSurveys } from '../../hooks/useUserSurveys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { NewSurveyCard } from './new-survey-card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/umum/pagination';

interface UserSurveyListProps {
  page: number;
  limit?: number;
  filters?: Record<string, any>;
  onPageChange: (newPage: number) => void;
}

export function UserSurveyList({
  page,
  limit = 8,
  filters = { sort: "-updated_at"},
  onPageChange,
}: UserSurveyListProps) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const {
    surveys,
    isLoading,
    isError,
    errorMessage,
    refetch,
    meta,
  } = useUserSurveys({ page, limit, filters, enabled: shouldFetch });

  const totalPages = meta?.total_pages ?? 1;

  if (isLoading) {
    return (
      <div className="grid xl:grid-cols-4 md:grid-cols-3 grid-cols-2 xl:gap-8 md:gap-5 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-[250px] rounded-xl bg-glass-bg backdrop-blur-lg border border-glass-border shadow-inner"
            style={{
              background: 'var(--glass-background)',
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
              boxShadow: 'var(--glass-shadow)',
            }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col gap-4 items-center justify-center text-center px-6 py-8 rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-md"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <p className="text-destructive font-medium">
          {errorMessage || 'Gagal memuat survei kamu.'}
        </p>
        {refetch && (
          <Button
            onClick={() => refetch()}
            className="px-5 py-2 text-sm font-semibold rounded-lg border border-glass-border backdrop-blur-md shadow-md 
              bg-destructive/50 dark:bg-destructive/50 text-foreground hover:bg-destructive/40 dark:hover:bg-destructive/20 transition"
            style={{
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div
        className="grid lg:grid-cols-4 grid-cols-2 md:gap-5 gap-3"
      >
        <NewSurveyCard />
      </div>
    );
  }

  return (
    <>
      <div className="flex-grow">
        <div className="grid lg:grid-cols-4 grid-cols-2 md:gap-5 gap-3">
          {page === 1 && <NewSurveyCard />}

          {surveys
            .slice(0, page === 1 ? limit - 1 : limit)
            .map((survey) => (
              <UserSurveyCard key={survey.id} surveys={survey} />
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
