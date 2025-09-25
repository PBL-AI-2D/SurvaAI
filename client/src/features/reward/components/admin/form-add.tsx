'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormGroup } from '@/components/umum/form/form-group'
import { useAdminCreateHadiah } from '../../hooks/useAdminReward'

const formSchema = z.object({
  nama: z.string().min(1, 'Reward name is required').max(255),
  deskripsi: z.string().optional(),
  stok: z.coerce
    .number({ invalid_type_error: 'Stock must be a number' })
    .int()
    .min(0, 'Stock cannot be negative'),
  harga_poin: z.coerce
    .number({ invalid_type_error: 'Point price must be a number' })
    .int()
    .min(1, 'Point price must be at least 1'),
})

type FormValues = z.infer<typeof formSchema>

export const FormAddReward = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { mutateAsync: createReward } = useAdminCreateHadiah()

  const onSubmit = async (values: FormValues) => {
    try {
      await createReward({
        nama: values.nama,
        deskripsi: values.deskripsi,
        stok: values.stok,
        harga_poin: values.harga_poin,
      })

      toast.success('Reward added successfully')
      reset()
      router.push('/admin/manage-reward')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add reward')
    }
  }

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Reward Name" htmlFor="nama">
        <Input
          id="nama"
          type="text"
          placeholder="Enter reward name"
          {...register('nama')}
          className={inputStyle}
        />
        {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <textarea
          id="deskripsi"
          placeholder="Enter description (optional)"
          {...register('deskripsi')}
          className={`${inputStyle} w-full h-24 text-sm rounded-md px-2 py-1`}
        />
      </FormGroup>

      <FormGroup label="Point Price" htmlFor="harga_poin">
        <Input
          id="harga_poin"
          type="number"
          min={1}
          placeholder="e.g. 100"
          {...register('harga_poin')}
          className={inputStyle}
        />
        {errors.harga_poin && (
          <p className="text-sm text-red-500">{errors.harga_poin.message}</p>
        )}
      </FormGroup>

      <FormGroup label="Stock" htmlFor="stok">
        <Input
          id="stok"
          type="number"
          min={0}
          placeholder="e.g. 10"
          {...register('stok')}
          className={inputStyle}
        />
        {errors.stok && <p className="text-sm text-red-500">{errors.stok.message}</p>}
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
  )
}
