'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { usePengguna, useUpdatePengguna } from '../../hooks/useUser';
import { toast } from 'sonner';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(255).optional().or(z.literal('')),
  email_confirmed: z.enum(['true', 'false']),
  nama: z.string().max(255),
  tanggal_lahir: z.string().optional(),
  jenis_kelamin: z.enum(['laki laki', 'perempuan']).optional(),
  region: z.string().optional(),
  status: z.string().optional(),
  nama_klien: z.string().optional(),
  kontak_klien: z.string().optional(),
  alamat_klien: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormEditUmumProps {
  userId: string;
}

export const FormEditUmum = ({ userId }: FormEditUmumProps) => {
  const { data, isLoading, isFetching, isError, error, refetch } = usePengguna(userId);
  const { mutateAsync: updatePengguna, isPending: isUpdating } = useUpdatePengguna();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      email_confirmed: 'false',
      nama: '',
      tanggal_lahir: '',
      jenis_kelamin: undefined,
      region: '',
      status: '',
      nama_klien: '',
      kontak_klien: '',
      alamat_klien: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    if (data?.data) {
      const user = data.data;
      const umum = user.Umum;

      reset({
        email: user.email,
        password: '',
        email_confirmed: String(user.email_confirmed ?? 'false') as 'true' | 'false',
        nama: umum?.nama ?? '',
        tanggal_lahir: umum?.profil_responden?.tanggal_lahir ?? '',
        jenis_kelamin: umum?.profil_responden?.jenis_kelamin as 'laki laki' | 'perempuan' | undefined,
        region: umum?.profil_responden?.region ?? '',
        status: umum?.profil_responden?.status ?? '',
        nama_klien: umum?.profil_klien?.nama_klien ?? '',
        kontak_klien: umum?.profil_klien?.kontak_klien ?? '',
        alamat_klien: umum?.profil_klien?.alamat_klien ?? '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: FormValues) => {
    try {
      await updatePengguna({
        id: userId,
        payload: {
          email: formData.email,
          password: formData.password || undefined,
          email_confirmed: formData.email_confirmed === 'true',
          role: 'umum',
          umum: {
            nama: formData.nama,
            profil_responden: {
              tanggal_lahir: formData.tanggal_lahir,
              jenis_kelamin: formData.jenis_kelamin,
              region: formData.region,
              status: formData.status,
            },
            profil_klien: {
              nama_klien: formData.nama_klien,
              kontak_klien: formData.kontak_klien,
              alamat_klien: formData.alamat_klien,
            },
          },
        },
      });

      toast.success('User data successfully updated');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user data');
    }
  };

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-grow justify-center items-center text-muted-foreground text-sm">
        Loading user data...
      </div>
    );
  }

  if ((isError || !data?.data) && !isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive font-medium">
          Failed to load user data. {error?.message && `(${error.message})`}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="text-sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <FormGroup label="Email" htmlFor="email">
        <Input id="email" placeholder="Enter email" {...register('email')} className={inputStyle} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </FormGroup>

      <FormGroup label="Password (leave blank to keep current)" htmlFor="password">
        <Input id="password" type="password" placeholder="Enter new password" {...register('password')} className={inputStyle} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </FormGroup>

      <FormGroup label="Email Status" htmlFor="email_confirmed">
        <select
          id="email_confirmed"
          {...register('email_confirmed')}
          className='w-full px-2 h-10 rounded-md border border-glass-border bg-transparent backdrop-blur-md text-foreground text-sm placeholder:text-muted-foreground/50'
        >
          <option value="true" className="bg-background text-foreground">Verified</option>
          <option value="false" className="bg-background text-foreground">Not verified</option>
        </select>
        {errors.email_confirmed && <p className="text-sm text-destructive">{errors.email_confirmed.message}</p>}
      </FormGroup>

      <FormGroup label="Full Name" htmlFor="nama">
        <Input id="nama" placeholder="Enter full name" {...register('nama')} className={inputStyle} />
        {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
      </FormGroup>

      <FormGroup label="Date of Birth" htmlFor="tanggal_lahir">
        <Input id="tanggal_lahir" type="date" {...register('tanggal_lahir')} className={inputStyle} />
        {errors.tanggal_lahir && <p className="text-sm text-destructive">{errors.tanggal_lahir.message}</p>}
      </FormGroup>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <select
          id="jenis_kelamin"
          {...register('jenis_kelamin')}
          className='w-full px-2 h-10 rounded-md border border-glass-border bg-transparent backdrop-blur-md text-foreground text-sm placeholder:text-muted-foreground/50'
          defaultValue=""
        >
          <option value="laki laki" className="bg-background text-foreground">Male</option>
          <option value="perempuan" className="bg-background text-foreground">Female</option>
        </select>
        {errors.jenis_kelamin && <p className="text-sm text-destructive">{errors.jenis_kelamin.message}</p>}
      </FormGroup>

      <FormGroup label="Region" htmlFor="region">
        <Input id="region" placeholder="Enter region" {...register('region')} className={inputStyle} />
        {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
      </FormGroup>

      <FormGroup label="Occupation / Education Status" htmlFor="status">
        <Input id="status" placeholder="Enter occupation or education status" {...register('status')} className={inputStyle} />
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </FormGroup>

      <FormGroup label="Client Name" htmlFor="nama_klien">
        <Input id="nama_klien" placeholder="Enter client name" {...register('nama_klien')} className={inputStyle} />
        {errors.nama_klien && <p className="text-sm text-destructive">{errors.nama_klien.message}</p>}
      </FormGroup>

      <FormGroup label="Client Contact" htmlFor="kontak_klien">
        <Input id="kontak_klien" placeholder="Enter client contact" {...register('kontak_klien')} className={inputStyle} />
        {errors.kontak_klien && <p className="text-sm text-destructive">{errors.kontak_klien.message}</p>}
      </FormGroup>

      <FormGroup label="Client Address" htmlFor="alamat_klien">
        <Input id="alamat_klien" placeholder="Enter client address" {...register('alamat_klien')} className={inputStyle} />
        {errors.alamat_klien && <p className="text-sm text-destructive">{errors.alamat_klien.message}</p>}
      </FormGroup>

      <Button
        type="submit"
        disabled={isUpdating}
        className="w-full text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 50%, var(--color-primary-3) 100%)`,
        }}
      >
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};
