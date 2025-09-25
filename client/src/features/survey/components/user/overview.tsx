'use client';

import { DetailItem } from '@/components/umum/detail-item';
import { useUserSurvey } from '../../hooks/useUserSurveys';
import { formatDate } from '@/utils/dateFormat';
import { ExportSurveyButton } from '@/features/survey-response-result/components/export-survey-button';

interface SurveyOverviewProps {
  surveiId: string;
}

export const SurveyOverview = ({ surveiId }: SurveyOverviewProps) => {
  const { data: survey, isLoading, isError } = useUserSurvey(surveiId);

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[200px] text-muted-foreground text-sm">
        Loading survey overview...
      </div>
    );

  if (isError || !survey)
    return (
      <div className="flex justify-center items-center min-h-[200px] text-destructive text-sm">
        Failed to load survey data.
      </div>
    );

  return (
    <div
      className="flex flex-col flex-grow rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md p-4 sm:p-6 gap-3 sm:text-sm text-xs text-foreground"
      style={{
        background: 'var(--glass-background)',
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'var(--glass-blur)',
      }}
    >
      <div className="flex justify-end">
        <ExportSurveyButton surveiId={survey.id} surveiJudul={survey.judul} />
      </div>

      <DetailItem label="Title" value={survey.judul} />
      <DetailItem label="Status" value={survey.status} />
      <DetailItem label="Description" value={survey.deskripsi || '-'} />
      <DetailItem label="Total Respondents" value={survey.jumlah_responden} />
      <DetailItem label="Start Date" value={formatDate(survey.tanggal_mulai)} />
      <DetailItem label="End Date" value={formatDate(survey.tanggal_berakhir)} />
      <DetailItem label="Reward Points" value={survey.hadiah_poin || '-'} />
      <DetailItem label="Created At" value={formatDate(survey.created_at)} />
      <DetailItem label="Last Updated" value={formatDate(survey.updated_at)} />
    </div>
  );
};
