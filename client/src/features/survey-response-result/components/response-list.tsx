'use client';

import { useResponSurveis } from '../hooks/useUserSurveyResponseresult';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Pagination } from '@/components/umum/pagination';
import { formatDateTime } from '@/utils/dateFormat';
import { User, Clock, ListCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ResponListProps {
  surveiId: string;
  page: number;
  limit?: number;
  filters?: Record<string, any>;
  onPageChange: (newPage: number) => void;
}

export default function ResponList({
  surveiId,
  page,
  limit = 10,
  filters = {},
  onPageChange,
}: ResponListProps) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const {
    responSurveis,
    isLoading,
    isError,
    error,
    meta,
    refetch
  } = useResponSurveis(surveiId, {
    page,
    limit,
    filters,
    enabled: shouldFetch,
  });

  const totalPages = meta?.total_pages ?? 1;

  if (isLoading) {
    return (
      <div
        className="flex flex-col flex-grow rounded-xl sm:p-5 p-3 gap-3 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <ul className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <li
              key={i}
              className="h-[100px] rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border animate-pulse"
              style={{
                background: 'var(--glass-background)',
                borderColor: 'var(--glass-border)',
                backdropFilter: 'var(--glass-blur)',
              }}
            />
          ))}
        </ul>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-grow flex-col items-center justify-center text-center gap-4 min-h-[200px] rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm px-6 py-8"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <div className="text-destructive text-sm">
          Failed to load data: {error?.message || 'An unexpected error occurred.'}
        </div>
        {typeof refetch === 'function' && (
          <Button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium rounded-md border border-glass-border bg-destructive/30 hover:bg-destructive/50 transition text-foreground backdrop-blur-md shadow-sm"
            style={{
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!responSurveis.length) {
    return (
      <div
        className="flex flex-grow items-center justify-center h-full rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm px-6 py-8"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <p className="text-muted-foreground text-sm italic">No responses available.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex flex-col flex-grow rounded-xl sm:p-5 p-3 gap-3 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <ul className="space-y-3">
          {responSurveis.map((respon) => (
            <li key={respon.id}>
              <Link href={`/manage-survey/responses/${respon.id_survei}/response/${respon.id}`}>
                <Card
                  className="p-4 hover:shadow-md transition cursor-pointer border border-glass-border bg-glass-bg backdrop-blur-xl"
                  style={{
                    background: 'var(--glass-background)',
                    borderColor: 'var(--glass-border)',
                    backdropFilter: 'var(--glass-blur)',
                  }}
                >
                  <div className="flex flex-col gap-1 text-sm text-foreground">
                    <div className="flex items-center gap-2 text-base font-medium truncate">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="line-clamp-1">{respon.Umum?.nama || '[Deleted User]'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ListCheck className="w-4 h-4" />
                      <span className="break-words w-full">
                        {respon.profil_metadata.status} • {respon.profil_metadata.region} • {respon.profil_metadata.usia} y.o. • {respon.profil_metadata.jenis_kelamin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(respon.created_at)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
