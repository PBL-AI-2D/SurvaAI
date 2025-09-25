'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { useAdminSurvey } from '../../hooks/useAdminSurveys';
import { formatDate } from '@/utils/dateFormat';
import { Separator } from '@/components/ui/separator';

interface FormDetailSurveyProps {
  surveyId: string;
}

export const FormDetailSurvey = ({ surveyId }: FormDetailSurveyProps) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminSurvey(surveyId);

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  if (isLoading || isFetching) {
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

  const survei = data;

  return (
    <div className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <FormGroup label="Id" htmlFor="id">
        <Input id="id" value={survei.id || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Umum Id" htmlFor="id_umum">
        <Input id="id_umum" value={survei.Umum?.id || '[Deleted User]'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Survey Title" htmlFor="judul">
        <Input id="judul" value={survei.judul || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Status" htmlFor="status">
        <Input id="status" value={survei.status || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <Input id="deskripsi" value={survei.deskripsi || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Target Respondents" htmlFor="jumlah_responden">
        <Input
          id="jumlah_responden"
          value={survei.jumlah_responden?.toString() || '-'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Start Date" htmlFor="tanggal_mulai">
        <Input
          id="tanggal_mulai"
          value={formatDate(survei.tanggal_mulai)}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="End Date" htmlFor="tanggal_berakhir">
        <Input
          id="tanggal_berakhir"
          value={formatDate(survei.tanggal_berakhir)}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Reward Points" htmlFor="poin">
        <Input
          id="poin"
          value={survei.hadiah_poin?.toString() || '0'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <Separator className="border border-foreground/10" />
      <h3 className="font-semibold text-lg">Respondent Criteria</h3>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <Input
          id="jenis_kelamin"
          value={
            survei.kriteria.jenis_kelamin === 'laki laki'
              ? 'Male'
              : survei.kriteria.jenis_kelamin === 'perempuan'
              ? 'Female'
              : 'All'
          }
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Min Age" htmlFor="usia_min">
        <Input
          id="usia_min"
          value={
            Array.isArray(survei.kriteria.usia) && survei.kriteria.usia.length > 0
              ? Math.min(...survei.kriteria.usia).toString()
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
            Array.isArray(survei.kriteria.usia) && survei.kriteria.usia.length > 0
              ? Math.max(...survei.kriteria.usia).toString()
              : '-'
          }
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Region / Domicile" htmlFor="region">
        <Input
          id="region"
          value={survei.kriteria.region?.join(', ') || '-'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Occupation / Education Status" htmlFor="status">
        <Input
          id="status"
          value={survei.kriteria.status?.join(', ') || '-'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Created At" htmlFor="created_at">
        <Input
          id="created_at"
          value={new Date(survei.created_at).toLocaleString('id-ID')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Last Updated" htmlFor="updated_at">
        <Input
          id="updated_at"
          value={new Date(survei.updated_at).toLocaleString('id-ID')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>
    </div>
  );
};
