'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormGroup } from '@/components/umum/form/form-group'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAdminHadiah, useAdminUpdateHadiah } from '../../hooks/useAdminReward'

const formSchema = z.object({
  nama: z.string().min(1, 'Reward name is required').max(255),
  deskripsi: z.string().max(500).optional(),
  stok: z.coerce.number().nonnegative({ message: 'Stock cannot be negative' }),
  harga_poin: z.coerce.number().positive({ message: 'Point price must be greater than 0' }),
})

type FormValues = z.infer<typeof formSchema>

interface FormEditHadiahProps {
  rewardId: string
}

export const FormEditReward = ({ rewardId }: FormEditHadiahProps) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminHadiah(rewardId)

  const { mutateAsync: updateReward, isPending: isUpdating } = useAdminUpdateHadiah()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: '',
      deskripsi: '',
      stok: 0,
      harga_poin: 0,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form

  useEffect(() => {
    if (data) {
      reset({
        nama: data.nama,
        deskripsi: data.deskripsi ?? '',
        stok: parseInt(data.stok),
        harga_poin: parseInt(data.harga_poin),
      })
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await updateReward({
        id: rewardId,
        data: {
          nama: values.nama,
          deskripsi: values.deskripsi,
          stok: values.stok,
          harga_poin: values.harga_poin,
        },
      })

      toast.success('Reward updated successfully')
      refetch()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update reward')
    }
  }

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Reward Name" htmlFor="nama">
        <Input id="nama" {...register('nama')} className={inputStyle} />
        {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <Input id="deskripsi" {...register('deskripsi')} className={inputStyle} />
        {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi.message}</p>}
      </FormGroup>

      <FormGroup label="Point Price" htmlFor="harga_poin">
        <Input id="harga_poin" type="number" {...register('harga_poin')} className={inputStyle} />
        {errors.harga_poin && <p className="text-sm text-red-500">{errors.harga_poin.message}</p>}
      </FormGroup>

      <FormGroup label="Stock" htmlFor="stok">
        <Input id="stok" type="number" {...register('stok')} className={inputStyle} />
        {errors.stok && <p className="text-sm text-red-500">{errors.stok.message}</p>}
      </FormGroup>

      <Button
        type="submit"
        disabled={isUpdating}
        className="mt-auto w-full text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 50%, var(--color-primary-3) 100%)`,
          backgroundSize: 'cover',
        }}
      >
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
