'use client';

import { useEffect } from 'react';
import { useResponSurvei } from '../hooks/useUserSurveyResponseresult';
import { useInfiniteSurveyQuestions } from '@/features/survey-question/hooks/useUserSurveyQuestion';
import { formatDateTime } from '@/utils/dateFormat';
import { Card } from '@/components/ui/card';
import { DetailItem } from '@/components/umum/detail-item';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface Props {
  surveyId: string;
  responSurveyId: string;
}

export function ResponseDetail({ surveyId, responSurveyId }: Props) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const {
    responSurvei,
    isLoading: isLoadingRespon,
    isError: isErrorRespon,
    error,
  } = useResponSurvei(surveyId, responSurveyId, shouldFetch);

  const {
    data,
    isLoading: isLoadingPertanyaan,
    isError: isErrorPertanyaan,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSurveyQuestions(surveyId, shouldFetch);

  const pertanyaans = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages?.[0]?.meta?.total_items ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      if (scrollable - scrolled < 400 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoadingPertanyaan || isLoadingRespon || !shouldFetch) {
    return <div className="h-20 bg-glass-bg animate-pulse rounded-lg" />;
  }

  if (isErrorPertanyaan || isErrorRespon || !responSurvei) {
    return (
      <div
        className="text-red-600 bg-red-100 dark:bg-red-900/10 border border-red-300 dark:border-red-700 px-4 py-3 rounded-md"
      >
        Failed to load detail: {error?.message || 'Something went wrong.'}
      </div>
    );
  }

  const { Umum, profil_metadata, respon, created_at } = responSurvei;

  return (
    <div className="space-y-6">
      <Card
        className="flex flex-col bg-glass-bg backdrop-blur-md rounded-xl p-5 gap-3 border border-glass-border shadow-md text-foreground text-sm"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <DetailItem label="Name" value={Umum?.nama || '[Deleted User]'} />
        <DetailItem label="Email" value={Umum?.Pengguna.email || '[Deleted User]'} />
        <DetailItem
          label="Profile"
          value={`${profil_metadata.status} • ${profil_metadata.region} • ${profil_metadata.usia} y.o • ${profil_metadata.jenis_kelamin}`}
        />
        <DetailItem label="Submitted At" value={formatDateTime(created_at)} />
      </Card>

      <Card
        className="flex flex-col bg-glass-bg backdrop-blur-md rounded-xl p-5 gap-4 border border-glass-border shadow-md text-foreground text-sm"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <h3 className="font-semibold text-base">Survey Answers</h3>

        <ul className="space-y-3">
          {pertanyaans
            .sort((a, b) => a.index - b.index)
            .map((pertanyaan, index) => {
              const jawaban = respon[pertanyaan.id] ?? respon[pertanyaan.teks_pertanyaan];
              return (
                <li key={pertanyaan.id} className="border-b border-border pb-2">
                  <div className="text-muted-foreground font-medium mb-1">
                    {index + 1}. <span className="italic">{pertanyaan.teks_pertanyaan}</span>
                  </div>
                  <div>{Array.isArray(jawaban) ? jawaban.join(', ') : jawaban || '-'}</div>
                </li>
              );
            })}

          <div className="text-muted-foreground text-xs pt-3">
            Showing {pertanyaans.length} of {totalCount} answers
          </div>

          {isFetchingNextPage && (
            <li className="text-muted-foreground text-sm italic">Loading more...</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
