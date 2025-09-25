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
    nama_admin: z.string().min(1, { message: 'Name is required' }).max(255),
    kontak_darurat: z.string().min(1, { message: 'Emergency contact is required' }).max(255),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Password confirmation does not match',
  });

type FormValues = z.infer<typeof formSchema>;

export const FormAddAdmin = () => {
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
        role: 'admin',
        admin: {
          nama_admin: values.nama_admin,
          kontak_darurat: values.kontak_darurat,
        },
      });

      toast.success('Admin created successfully');
      reset();
      router.push('/admin/manage-admin');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          {...register('email')}
          className="bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </FormGroup>

      <FormGroup label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          placeholder="Enter a secure password"
          {...register('password')}
          className="bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </FormGroup>

      <FormGroup label="Confirm Password" htmlFor="password_confirmation">
        <Input
          id="password_confirmation"
          type="password"
          placeholder="Repeat your password"
          {...register('password_confirmation')}
          className="bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50"
        />
        {errors.password_confirmation && (
          <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
        )}
      </FormGroup>

      <FormGroup label="Admin Name" htmlFor="nama_admin">
        <Input
          id="nama_admin"
          type="text"
          placeholder="Full name of the admin"
          {...register('nama_admin')}
          className="bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50"
        />
        {errors.nama_admin && <p className="text-sm text-destructive">{errors.nama_admin.message}</p>}
      </FormGroup>

      <FormGroup label="Emergency Contact" htmlFor="kontak_darurat">
        <Input
          id="kontak_darurat"
          type="text"
          placeholder="Phone or email for emergency contact"
          {...register('kontak_darurat')}
          className="bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50"
        />
        {errors.kontak_darurat && <p className="text-sm text-destructive">{errors.kontak_darurat.message}</p>}
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
