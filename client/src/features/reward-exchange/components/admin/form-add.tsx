'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormGroup } from '@/components/umum/form/form-group'
import { useAdminCreateRewardExchange } from '../../hooks/useAdminRewardExchange'

const formSchema = z.object({
  id_umum: z.string().min(1, 'User ID is required'),
  id_hadiah: z.string().min(1, 'Reward ID is required'),
})

type FormValues = z.infer<typeof formSchema>

export const FormAddRewardExchange = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { mutateAsync: createExchange } = useAdminCreateRewardExchange()

  const onSubmit = async (values: FormValues) => {
    try {
      await createExchange(values)
      toast.success('Reward exchange added successfully')
      reset()
      router.push('/admin/manage-exchange')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add reward exchange')
    }
  }

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <FormGroup label="Umum user ID" htmlFor="id_umum">
        <Input
          id="id_umum"
          type="text"
          placeholder="Enter umum user ID"
          {...register('id_umum')}
          className={inputStyle}
        />
        {errors.id_umum && (
          <p className="text-sm text-destructive">{errors.id_umum.message}</p>
        )}
      </FormGroup>

      <FormGroup label="Reward ID" htmlFor="id_hadiah">
        <Input
          id="id_hadiah"
          type="text"
          placeholder="Enter reward ID"
          {...register('id_hadiah')}
          className={inputStyle}
        />
        {errors.id_hadiah && (
          <p className="text-sm text-destructive">{errors.id_hadiah.message}</p>
        )}
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
