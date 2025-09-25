'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { useAdminSurvey, useUpdateAdminSurvey } from '../../hooks/useAdminSurveys';
import { toast } from 'sonner';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';

interface FormUpdateSurveyProps {
  surveyId: string;
}

const surveySchema = z
  .object({
    judul: z.string().min(1, 'Survey title is required'),
    status_survei: z.enum([
      'draft',
      'under_review',
      'payment_pending',
      'published',
      'closed',
      'archived',
      'rejected',
    ]),
    deskripsi: z.string().optional(),
    jumlah_responden: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Target respondents must be a positive number',
    }),
    tanggal_mulai: z.string().min(1, 'Start date is required'),
    tanggal_berakhir: z.string().min(1, 'End date is required'),
    usia_min: z.string().optional().refine(
      (val) => val === '' || !isNaN(Number(val)),
      { message: 'Minimum age must be a number' }
    ),
    usia_max: z.string().optional().refine(
      (val) => val === '' || !isNaN(Number(val)),
      { message: 'Maximum age must be a number' }
    ),
    jenis_kelamin: z.string().optional(),
    region: z.string().optional(),
    status: z.string().optional(),
    hadiah_poin: z.string().min(1, 'Reward points is required').refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Reward point must be a positive number or empty',
    }),
  })
  .refine((data) => {
    const min = Number(data.usia_min);
    const max = Number(data.usia_max);
    if (data.usia_min && data.usia_max) return min <= max;
    return true;
  }, {
    message: 'Minimum age must not exceed maximum age',
    path: ['usia_max'],
  })
  .refine((data) => new Date(data.tanggal_mulai) <= new Date(data.tanggal_berakhir), {
    path: ['tanggal_berakhir'],
    message: 'Start date cannot be after end date',
  });

type FormValues = z.infer<typeof surveySchema>;

export const FormEditSurvey = ({ surveyId }: FormUpdateSurveyProps) => {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminSurvey(surveyId);
  const { mutateAsync: updateSurvey, isPending } = useUpdateAdminSurvey();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      judul: '',
      status_survei: 'draft',
      deskripsi: '',
      jumlah_responden: '',
      tanggal_mulai: '',
      tanggal_berakhir: '',
      usia_min: '',
      usia_max: '',
      jenis_kelamin: '',
      region: '',
      status: '',
      hadiah_poin: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        judul: data.judul || '',
        status_survei: data.status || 'draft',
        deskripsi: data.deskripsi || '',
        jumlah_responden: data.jumlah_responden?.toString() || '',
        tanggal_mulai: data.tanggal_mulai?.split('T')[0] || '',
        tanggal_berakhir: data.tanggal_berakhir?.split('T')[0] || '',
        usia_min: data.kriteria.usia?.length ? String(Math.min(...data.kriteria.usia)) : '',
        usia_max: data.kriteria.usia?.length ? String(Math.max(...data.kriteria.usia)) : '',
        jenis_kelamin: data.kriteria.jenis_kelamin || '',
        region: (data.kriteria.region || []).join(', '),
        status: (data.kriteria.status || []).join(', '),
        hadiah_poin: data.hadiah_poin?.toString() || '',
      });
    }
  }, [data, reset]);

  const generateUsiaRangeFlexible = (minStr: string, maxStr: string): number[] | undefined => {
    const isMinEmpty = minStr.trim() === '';
    const isMaxEmpty = maxStr.trim() === '';
    if (isMinEmpty && isMaxEmpty) return undefined;
    const min = !isMinEmpty ? Number(minStr) : 1;
    const max = !isMaxEmpty ? Number(maxStr) : 100;
    if (isNaN(min) || isNaN(max) || min > max) return undefined;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  };

  const onSubmit = async (values: FormValues) => {
    const usiaRange = generateUsiaRangeFlexible(values.usia_min || '', values.usia_max || '');

    const kriteria: Record<string, any> = {
      ...(usiaRange && { usia: usiaRange }),
      ...(values.jenis_kelamin && { jenis_kelamin: values.jenis_kelamin }),
      ...(values.region && {
        region: values.region.split(',').map((r) => r.trim()).filter(Boolean),
      }),
      ...(values.status && {
        status: values.status.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    };

    try {
      await updateSurvey({
        id: surveyId,
        data: {
          judul: values.judul,
          status: values.status_survei,
          deskripsi: values.deskripsi,
          jumlah_responden: values.jumlah_responden,
          tanggal_mulai: values.tanggal_mulai,
          tanggal_berakhir: values.tanggal_berakhir,
          hadiah_poin: values.hadiah_poin,
          kriteria,
        },
      });
      toast.success('Survey updated successfully');
    } catch {
      toast.error('Failed to update survey');
    }
  };

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <FormGroup label="Survey Title" htmlFor="judul">
        <Input
          id="judul"
          placeholder="Enter the survey title"
          {...register('judul')}
          className={inputStyle}
        />
        {errors.judul && <p className="text-sm text-destructive">{errors.judul.message}</p>}
      </FormGroup>

      <FormGroup label="Survey Status" htmlFor="status_survei">
        <select
          id="status_survei"
          {...register('status_survei')}
          className={`${inputStyle} w-full h-10 rounded-md px-2 text-sm`}
        >
          <option value="draft" className="bg-background text-foreground">Draft</option>
          <option value="under_review" className="bg-background text-foreground">Under Review</option>
          <option value="payment_pending" className="bg-background text-foreground">Payment Pending</option>
          <option value="published" className="bg-background text-foreground">Published</option>
          <option value="closed" className="bg-background text-foreground">Closed</option>
          <option value="archived" className="bg-background text-foreground">Archived</option>
          <option value="rejected" className="bg-background text-foreground">Rejected</option>
        </select>
        {errors.status_survei && <p className="text-sm text-destructive">{errors.status_survei.message}</p>}
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <textarea
          id="deskripsi"
          placeholder="Describe your survey purpose..."
          {...register('deskripsi')}
          className={`${inputStyle} w-full h-24 text-sm rounded-md px-2 py-1`}
        />
        {errors.deskripsi && <p className="text-sm text-destructive">{errors.deskripsi.message}</p>}
      </FormGroup>

      <FormGroup label="Start Date" htmlFor="tanggal_mulai">
        <Input
          id="tanggal_mulai"
          type="date"
          placeholder="Select a start date"
          {...register('tanggal_mulai')}
          className={inputStyle}
        />
        {errors.tanggal_mulai && <p className="text-sm text-destructive">{errors.tanggal_mulai.message}</p>}
      </FormGroup>

      <FormGroup label="End Date" htmlFor="tanggal_berakhir">
        <Input
          id="tanggal_berakhir"
          type="date"
          placeholder="Select an end date"
          {...register('tanggal_berakhir')}
          className={inputStyle}
        />
        {errors.tanggal_berakhir && <p className="text-sm text-destructive">{errors.tanggal_berakhir.message}</p>}
      </FormGroup>

      <FormGroup label="Target Respondents" htmlFor="jumlah_responden">
        <Input
          id="jumlah_responden"
          type="number"
          placeholder="e.g. 100"
          {...register('jumlah_responden')}
          className={inputStyle}
        />
        {errors.jumlah_responden && <p className="text-sm text-destructive">{errors.jumlah_responden.message}</p>}
      </FormGroup>

      <FormGroup label="Reward Points" htmlFor="hadiah_poin">
        <Input
          id="hadiah_poin"
          type="number"
          placeholder="e.g. 50"
          {...register('hadiah_poin')}
          className={inputStyle}
        />
        {errors.hadiah_poin && <p className="text-sm text-destructive">{errors.hadiah_poin.message}</p>}
      </FormGroup>

      <Separator className="border border-foreground/10" />
      <h3 className="font-semibold text-lg">Respondent Criteria (Optional)</h3>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <select
          id="jenis_kelamin"
          {...register('jenis_kelamin')}
          className={`${inputStyle} w-full h-10 rounded-md px-2 text-sm`}
        >
          <option value="" className="bg-background text-foreground">All</option>
          <option value="laki laki" className="bg-background text-foreground">Male</option>
          <option value="perempuan" className="bg-background text-foreground">Female</option>
        </select>
        {errors.jenis_kelamin && <p className="text-sm text-destructive">{errors.jenis_kelamin.message}</p>}
      </FormGroup>

      <FormGroup label="Minimum Age" htmlFor="usia_min">
        <Input
          id="usia_min"
          type="number"
          placeholder="e.g. 18"
          {...register('usia_min')}
          className={inputStyle}
        />
        {errors.usia_min && <p className="text-sm text-destructive">{errors.usia_min.message}</p>}
      </FormGroup>

      <FormGroup label="Maximum Age" htmlFor="usia_max">
        <Input
          id="usia_max"
          type="number"
          placeholder="e.g. 35"
          {...register('usia_max')}
          className={inputStyle}
        />
        {errors.usia_max && <p className="text-sm text-destructive">{errors.usia_max.message}</p>}
      </FormGroup>

      <FormGroup label="Region(s) (comma-separated)" htmlFor="region">
        <Input
          id="region"
          placeholder="e.g. Jakarta, Bandung"
          {...register('region')}
          className={inputStyle}
        />
        {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
      </FormGroup>

      <FormGroup label="Occupation / Education Status (comma-separated)" htmlFor="status">
        <Input
          id="status"
          placeholder="e.g. Student, Employee"
          {...register('status')}
          className={inputStyle}
        />
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </FormGroup>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-auto w-full text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 50%, var(--color-primary-3) 100%)`,
        }}
      >
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};
