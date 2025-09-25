'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePengguna } from '../../hooks/useUser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }).max(255),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(255),
    password_confirmation: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    nama: z.string().min(1, { message: 'Name is required' }).max(255),
    tanggal_lahir: z.string().min(1, { message: 'Birth date is required' }),
    jenis_kelamin: z.enum(['laki laki', 'perempuan'], {
      errorMap: () => ({ message: 'Please select gender' }),
    }),
    region: z.string().min(1, { message: 'Region is required' }),
    status: z.string().min(1, { message: 'Status is required' }),
    nama_klien: z.string().optional(),
    kontak_klien: z.string().optional(),
    alamat_klien: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Password confirmation does not match',
  });

type FormValues = z.infer<typeof formSchema>;

export const FormAddUmum = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { mutateAsync: createPengguna } = useCreatePengguna();

  const onSubmit = async (values: FormValues) => {
    try {
      await createPengguna({
        email: values.email,
        password: values.password,
        role: 'umum',
        umum: {
          nama: values.nama,
          profil_responden: {
            tanggal_lahir: values.tanggal_lahir,
            jenis_kelamin: values.jenis_kelamin,
            region: values.region,
            status: values.status,
          },
          profil_klien: {
            nama_klien: values.nama_klien,
            kontak_klien: values.kontak_klien,
            alamat_klien: values.alamat_klien,
          },
        },
      });

      toast.success('User created successfully');
      reset();
      router.push('/admin/manage-user');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user');
    }
  };

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          {...register('email')}
          className={inputStyle}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </FormGroup>

      <FormGroup label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          placeholder="Enter a secure password"
          {...register('password')}
          className={inputStyle}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </FormGroup>

      <FormGroup label="Confirm Password" htmlFor="password_confirmation">
        <Input
          id="password_confirmation"
          type="password"
          placeholder="Repeat your password"
          {...register('password_confirmation')}
          className={inputStyle}
        />
        {errors.password_confirmation && (
          <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
        )}
      </FormGroup>

      <FormGroup label="Full Name" htmlFor="nama">
        <Input
          id="nama"
          type="text"
          placeholder="Enter full name"
          {...register('nama')}
          className={inputStyle}
        />
        {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
      </FormGroup>

      <FormGroup label="Birth Date" htmlFor="tanggal_lahir">
        <Input
          id="tanggal_lahir"
          type="date"
          {...register('tanggal_lahir')}
          className={inputStyle}
        />
        {errors.tanggal_lahir && <p className="text-sm text-destructive">{errors.tanggal_lahir.message}</p>}
      </FormGroup>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <select
          id="jenis_kelamin"
          {...register('jenis_kelamin')}
          defaultValue=""
          className="w-full px-2 h-10 rounded-md border border-glass-border bg-transparent backdrop-blur-md text-foreground text-sm placeholder:text-muted-foreground/50"
        >
          <option disabled hidden value="">Select gender</option>
          <option value="laki laki" className="bg-background text-foreground">Male</option>
          <option value="perempuan" className="bg-background text-foreground">Female</option>
        </select>
        {errors.jenis_kelamin && <p className="text-sm text-destructive">{errors.jenis_kelamin.message}</p>}
      </FormGroup>

      <FormGroup label="Region" htmlFor="region">
        <Input
          id="region"
          type="text"
          placeholder="Enter your region"
          {...register('region')}
          className={inputStyle}
        />
        {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
      </FormGroup>

      <FormGroup label="Work / Study Status" htmlFor="status">
        <Input
          id="status"
          type="text"
          placeholder="e.g. Student, Employee"
          {...register('status')}
          className={inputStyle}
        />
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </FormGroup>

      <FormGroup label="Client Name (optional)" htmlFor="nama_klien">
        <Input
          id="nama_klien"
          type="text"
          placeholder="Enter client name"
          {...register('nama_klien')}
          className={inputStyle}
        />
        {errors.nama_klien && <p className="text-sm text-destructive">{errors.nama_klien.message}</p>}
      </FormGroup>

      <FormGroup label="Client Contact (optional)" htmlFor="kontak_klien">
        <Input
          id="kontak_klien"
          type="text"
          placeholder="Enter client contact"
          {...register('kontak_klien')}
          className={inputStyle}
        />
        {errors.kontak_klien && <p className="text-sm text-destructive">{errors.kontak_klien.message}</p>}
      </FormGroup>

      <FormGroup label="Client Address (optional)" htmlFor="alamat_klien">
        <Input
          id="alamat_klien"
          type="text"
          placeholder="Enter client address"
          {...register('alamat_klien')}
          className={inputStyle}
        />
        {errors.alamat_klien && <p className="text-sm text-destructive">{errors.alamat_klien.message}</p>}
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
