'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAdminSurvey } from '../../hooks/useAdminSurveys';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { Separator } from '@/components/ui/separator';

const today = new Date();
const minStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const formSchema = z.object({
  id_umum: z.string().uuid({ message: 'Invalid user ID' }),
  judul: z.string().min(1, 'Title is required').max(255),
  deskripsi: z.string().optional(),
  jumlah_responden: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 1000;
  }, { message: 'Respondent count must be between 1 and 1000' }),
  tanggal_mulai: z.coerce.date().refine(date => date >= minStartDate, {
    message: 'Start date cannot be in the past',
  }),
  tanggal_berakhir: z.coerce.date(),
  usia_min: z.string().optional(),
  usia_max: z.string().optional(),
  jenis_kelamin: z.string().optional(),
  region: z.string().optional(),
  status: z.string().optional(),
})
.refine((data) => {
  const min = data.usia_min ? parseInt(data.usia_min) : undefined;
  const max = data.usia_max ? parseInt(data.usia_max) : undefined;
  return min === undefined || max === undefined || min <= max;
}, {
  message: 'Min age cannot be greater than max age',
  path: ['usia_max'],
})
.refine((data) => data.tanggal_berakhir > data.tanggal_mulai, {
  message: 'End date must be after start date',
  path: ['tanggal_berakhir'],
});

type FormValues = z.infer<typeof formSchema>;

const parseUsiaArray = (minStr?: string, maxStr?: string): number[] | undefined => {
  const min = minStr ? parseInt(minStr) : undefined;
  const max = maxStr ? parseInt(maxStr) : undefined;
  if (!min && !max) return undefined;
  if (min && !max) return Array.from({ length: 100 - min + 1 }, (_, i) => i + min);
  if (!min && max) return Array.from({ length: max }, (_, i) => i + 1);
  if (min && max && min <= max) return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return undefined;
};

const parseCommaSeparated = (input?: string): string[] | undefined => {
  if (!input) return undefined;
  const parsed = input.split(',').map(s => s.trim()).filter(Boolean);
  return parsed.length > 0 ? parsed : undefined;
};

export const FormAddSurvey = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { mutateAsync: createSurvey } = useCreateAdminSurvey();

  const onSubmit = async (values: FormValues) => {
    try {
      await createSurvey({
        id_umum: values.id_umum,
        judul: values.judul,
        deskripsi: values.deskripsi || '',
        jumlah_responden: values.jumlah_responden,
        tanggal_mulai: values.tanggal_mulai.toISOString(),
        tanggal_berakhir: values.tanggal_berakhir.toISOString(),
        kriteria: {
          usia: parseUsiaArray(values.usia_min, values.usia_max),
          jenis_kelamin: values.jenis_kelamin || undefined,
          region: parseCommaSeparated(values.region),
          status: parseCommaSeparated(values.status),
        },
      });

      toast.success('Survey created successfully');
      reset();
      router.push('/admin/manage-survey');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create survey');
    }
  };

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Umum ID" htmlFor="id_umum">
        <Input id="id_umum" placeholder="Enter Public user ID" {...register('id_umum')} className={inputStyle} />
        {errors.id_umum && <p className="text-sm text-red-500">{errors.id_umum.message}</p>}
      </FormGroup>

      <FormGroup label="Survey Title" htmlFor="judul">
        <Input id="judul" placeholder="Enter survey title" {...register('judul')} className={inputStyle} />
        {errors.judul && <p className="text-sm text-red-500">{errors.judul.message}</p>}
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <textarea id="deskripsi" placeholder="Enter description (optional)" {...register('deskripsi')} className={`${inputStyle} w-full h-24 text-sm rounded-md px-2 py-1`} />
      </FormGroup>

      <FormGroup label="Target Respondents" htmlFor="jumlah_responden">
        <Input id="jumlah_responden" type="number" placeholder="e.g. 100" {...register('jumlah_responden')} className={inputStyle} />
        {errors.jumlah_responden && <p className="text-sm text-red-500">{errors.jumlah_responden.message}</p>}
      </FormGroup>

      <FormGroup label="Start Date" htmlFor="tanggal_mulai">
        <Input id="tanggal_mulai" type="date" {...register('tanggal_mulai')} className={inputStyle} />
        {errors.tanggal_mulai && <p className="text-sm text-red-500">{errors.tanggal_mulai.message}</p>}
      </FormGroup>

      <FormGroup label="End Date" htmlFor="tanggal_berakhir">
        <Input id="tanggal_berakhir" type="date" {...register('tanggal_berakhir')} className={inputStyle} />
        {errors.tanggal_berakhir && <p className="text-sm text-red-500">{errors.tanggal_berakhir.message}</p>}
      </FormGroup>

      <Separator className="border border-foreground/10" />
      <h3 className="font-semibold text-lg">Respondent Criteria (Optional)</h3>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <select
          id="jenis_kelamin"
          {...register('jenis_kelamin')}
          defaultValue=""
          className={`${inputStyle} w-full h-10 rounded-md px-2 text-sm`}
        >
          <option disabled hidden value="">All</option>
          <option value="Laki-laki" className="bg-background text-foreground">Male</option>
          <option value="Perempuan" className="bg-background text-foreground">Female</option>
        </select>
      </FormGroup>

      <FormGroup label="Min Age" htmlFor="usia_min">
        <Input id="usia_min" type="number" min="1" max="100" placeholder="e.g. 18" {...register('usia_min')} className={inputStyle} />
        {errors.usia_min && <p className="text-sm text-red-500">{errors.usia_min.message}</p>}
      </FormGroup>

      <FormGroup label="Max Age" htmlFor="usia_max">
        <Input id="usia_max" type="number" min="1" max="100" placeholder="e.g. 30" {...register('usia_max')} className={inputStyle} />
        {errors.usia_max && <p className="text-sm text-red-500">{errors.usia_max.message}</p>}
      </FormGroup>

      <FormGroup label="Region(s) (comma separated)" htmlFor="region">
        <Input id="region" placeholder="e.g. Jakarta, Bandung" {...register('region')} className={inputStyle} />
      </FormGroup>

      <FormGroup label="Occupation / Education Status (comma separated)" htmlFor="status">
        <Input id="status" placeholder="e.g. Student, Employee" {...register('status')} className={inputStyle} />
      </FormGroup>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-auto w-full text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 50%, var(--color-primary-3) 100%)`,
          backgroundSize: 'cover',
        }}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};
