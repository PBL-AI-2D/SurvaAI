'use client';

import { useRouter } from 'next/navigation';
import { useAdminSurvey } from '@/features/survey/hooks/useAdminSurveys';
import { SurveyVerificationActions } from './survey-verification-actions';
import { QuestionList } from '@/features/survey-question/components/admin/question-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/umum/form/form-group';
import { useEffect, useState } from 'react';
import { formatDateTime } from '@/utils/dateFormat';

interface Props {
  surveyId: string;
}

export const SurveyVerificationContainer = ({ surveyId }: Props) => {
  const router = useRouter();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminSurvey(surveyId);

  const [hasRedirected, setHasRedirected] = useState(false);
  const loading = isLoading || isFetching;

  useEffect(() => {
    if (!loading && data && data.status !== 'under_review' && !hasRedirected) {
      setHasRedirected(true);
      router.push('/admin/manage-verification');
    }
  }, [data, loading, router, hasRedirected]);

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  if (isLoading) {
    return (
      <div className="flex flex-grow justify-center items-center text-muted-foreground text-sm">
        Loading Data...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive font-medium">
          Failed to load data. {error?.message && `(${error.message})`}
        </p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="text-sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const survey = data;

  const gender =
    survey.kriteria.jenis_kelamin === 'laki laki'
      ? 'Male'
      : survey.kriteria.jenis_kelamin === 'perempuan'
      ? 'Female'
      : 'All';

  return (
    <div className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <SurveyVerificationActions surveyId={surveyId} />

      <FormGroup label="Survey Title" htmlFor="judul">
        <Input id="judul" value={survey.judul || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Survey Status" htmlFor="status">
        <Input id="status" value={survey.status || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <Input id="deskripsi" value={survey.deskripsi || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Target Respondents" htmlFor="jumlah_responden">
        <Input id="jumlah_responden" value={survey.jumlah_responden?.toString() || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Start Date" htmlFor="tanggal_mulai">
        <Input id="tanggal_mulai" value={formatDateTime(survey.tanggal_mulai)} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="End Date" htmlFor="tanggal_berakhir">
        <Input id="tanggal_berakhir" value={formatDateTime(survey.tanggal_berakhir)} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Reward Points" htmlFor="poin">
        <Input id="poin" value={survey.hadiah_poin?.toString() || '0'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <div className="grid grid-cols-1 gap-5 pt-6 border-t">
        <h3 className="font-semibold text-lg">Respondent Criteria</h3>

        <FormGroup label="Gender" htmlFor="jenis_kelamin">
          <Input id="jenis_kelamin" value={gender} readOnly disabled className={inputStyle} />
        </FormGroup>

        <FormGroup label="Min Age" htmlFor="usia_min">
          <Input
            id="usia_min"
            value={
              Array.isArray(survey.kriteria.usia) && survey.kriteria.usia.length > 0
                ? Math.min(...survey.kriteria.usia).toString()
                : '-'
            }
            readOnly
            disabled
            className={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Max Age" htmlFor="usia_max">
          <Input
            id="usia_max"
            value={
              Array.isArray(survey.kriteria.usia) && survey.kriteria.usia.length > 0
                ? Math.max(...survey.kriteria.usia).toString()
                : '-'
            }
            readOnly
            disabled
            className={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Region / Domicile" htmlFor="region">
          <Input id="region" value={survey.kriteria.region?.join(', ') || '-'} readOnly disabled className={inputStyle} />
        </FormGroup>

        <FormGroup label="Occupation / Education Status" htmlFor="status">
          <Input id="status" value={survey.kriteria.status?.join(', ') || '-'} readOnly disabled className={inputStyle} />
        </FormGroup>

        <FormGroup label="Created At" htmlFor="created_at">
          <Input
            id="created_at"
            value={new Date(survey.created_at).toLocaleString('id-ID')}
            readOnly
            disabled
            className={inputStyle}
          />
        </FormGroup>
      </div>

      <FormGroup label="Last Updated" htmlFor="updated_at">
        <Input
          id="updated_at"
          value={new Date(survey.updated_at).toLocaleString('id-ID')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <div className="pt-6 border-t">
        <h3 className="font-semibold text-lg">Survey Questions</h3>
      </div>

      <QuestionList surveyId={surveyId} />
    </div>
  );
};
