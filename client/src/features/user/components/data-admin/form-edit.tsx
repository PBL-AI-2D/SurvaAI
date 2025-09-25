'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { Skeleton } from '@/components/ui/skeleton';
import { usePengguna, useUpdatePengguna } from '../../hooks/useUser';
import { toast } from 'sonner';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(255).optional().or(z.literal('')),
  nama_admin: z.string().max(255),
  kontak_darurat: z.string().max(255),
});

type FormValues = z.infer<typeof formSchema>;

interface FormEditAdminProps {
  userId: string;
}

export const FormEditAdmin = ({ userId }: FormEditAdminProps) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePengguna(userId);

  const { mutateAsync: updatePengguna, isPending: isUpdating } = useUpdatePengguna();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      nama_admin: '',
      kontak_darurat: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    if (data?.data) {
      const pengguna = data.data;
      reset({
        email: pengguna.email,
        password: '',
        nama_admin: pengguna.Admin?.nama_admin ?? '',
        kontak_darurat: pengguna.Admin?.kontak_darurat ?? '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePengguna({
        id: userId,
        payload: {
          email: values.email,
          password: values.password || undefined,
          role: 'admin',
          admin: {
            nama_admin: values.nama_admin,
            kontak_darurat: values.kontak_darurat,
          },
        },
      });

      toast.success('User data updated successfully');
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Email" htmlFor="email">
        <Input
          id="email"
          placeholder="Enter email"
          {...register('email')}
          className={inputStyle}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </FormGroup>

      <FormGroup label="Password (leave blank to keep current)" htmlFor="password">
        <Input
          id="password"
          type="password"
          placeholder="Enter new password"
          {...register('password')}
          className={inputStyle}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </FormGroup>

      <FormGroup label="Admin Name" htmlFor="nama_admin">
        <Input
          id="nama_admin"
          placeholder="Enter admin name"
          {...register('nama_admin')}
          className={inputStyle}
        />
        {errors.nama_admin && <p className="text-sm text-red-500">{errors.nama_admin.message}</p>}
      </FormGroup>

      <FormGroup label="Emergency Contact" htmlFor="kontak_darurat">
        <Input
          id="kontak_darurat"
          placeholder="Enter emergency contact"
          {...register('kontak_darurat')}
          className={inputStyle}
        />
        {errors.kontak_darurat && <p className="text-sm text-red-500">{errors.kontak_darurat.message}</p>}
      </FormGroup>

      <Button
        type="submit"
        disabled={isUpdating}
        className="mt-auto w-full text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 50%, var(--color-primary-3) 100%)`,
        }}
      >
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};
