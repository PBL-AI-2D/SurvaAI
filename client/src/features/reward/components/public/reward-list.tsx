'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHadiahs } from '../../hooks/usePublicReward';
import { RewardCard } from './reward-card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/umum/pagination';

interface RewardListProps {
  page: number;
  limit?: number;
  filters?: Record<string, any>;
  onPageChange: (newPage: number) => void;
}

export function RewardList({
  page,
  limit = 10,
  filters = {},
  onPageChange,
}: RewardListProps) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const {
    hadiahs,
    isLoading,
    isError,
    errorMessage,
    refetch,
    meta,
  } = useHadiahs({ page, limit, filters, enabled: shouldFetch });

  const totalPages = meta?.total_pages ?? 1;

  if (isLoading) {
    return (
      <div className="grid xl:grid-cols-5 grid-cols-2 md:gap-5 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-[200px] rounded-xl bg-glass-bg backdrop-blur-lg border border-glass-border shadow-inner"
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
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <p className="text-destructive font-medium mb-4">
          {errorMessage || 'Failed to load rewards.'}
        </p>
        {refetch && (
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
        )}
      </div>
    );
  }

  if (hadiahs.length === 0) {
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
        <p className="text-base font-medium italic">No rewards are currently available.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-grow">
        <div className="grid xl:grid-cols-5 grid-cols-2 md:gap-5 gap-3">
          {hadiahs.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
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
