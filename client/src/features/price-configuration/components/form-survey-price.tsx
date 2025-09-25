"use client";

import { useEffect, useState } from 'react';
import { useCreateKonfigurasiHarga, useKonfigurasiHarga, useUpdateKonfigurasiHarga } from '../hooks/usePriceConfiguration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FormGroup } from '@/components/umum/form/form-group';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { defaultSurveyPriceConfig } from '../constant/constants';

const formSchema = z.object({
  harga_dasar: z.string().min(1, 'Base price is required'),
  harga_per_pertanyaan: z.string().min(1, 'Price per question is required'),
  harga_per_responden: z.string().min(1, 'Price per respondent is required'),
  harga_per_durasi: z.string().min(1, 'Price per duration is required'),
});

export function FormSurveyPrice() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { config, isLoading, isFetching, isError, error, refetch } = useKonfigurasiHarga();
  const { mutateAsync: createConfig, isPending: isCreating } = useCreateKonfigurasiHarga();
  const { mutateAsync: updateConfig, isPending } = useUpdateKonfigurasiHarga();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      harga_dasar: '',
      harga_per_pertanyaan: '',
      harga_per_responden: '',
      harga_per_durasi: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (config) {
      reset({
        harga_dasar: isEditMode ? parseInt(config.harga_dasar || '0').toString() : config.harga_dasar?.toString() || '',
        harga_per_pertanyaan: isEditMode ? parseInt(config.harga_per_pertanyaan || '0').toString() : config.harga_per_pertanyaan?.toString() || '',
        harga_per_responden: isEditMode ? parseInt(config.harga_per_responden || '0').toString() : config.harga_per_responden?.toString() || '',
        harga_per_durasi: isEditMode ? parseInt(config.harga_per_durasi || '0').toString() : config.harga_per_durasi?.toString() || '',
      });
    }
  }, [config, isEditMode, reset]);

  const handleInitializePricing = async () => {
    try {
      await createConfig(defaultSurveyPriceConfig);
      toast.success('Default pricing initialized');
      refetch();
      setIsEditMode(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initialize pricing');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateConfig({
        harga_dasar: parseFloat(values.harga_dasar),
        harga_per_pertanyaan: parseFloat(values.harga_per_pertanyaan),
        harga_per_responden: parseFloat(values.harga_per_responden),
        harga_per_durasi: parseFloat(values.harga_per_durasi),
      });
      toast.success('Survey pricing updated successfully');
      refetch();
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save pricing');
    }
  };

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-grow justify-center items-center text-muted-foreground text-sm">
        Loading data...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive font-medium">
          Failed to load data. {error?.message && `(${error.message})`}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="text-sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-destructive font-medium">
          No pricing configuration found.
        </p>
        <Button
          onClick={handleInitializePricing}
          disabled={isCreating}
          className="border-glass-border bg-glass-bg bg-background/80 text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
        >
          {isCreating ? 'Initializing...' : 'Initialize Default Pricing'}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
        <FormGroup label="Base Price" htmlFor="harga_dasar">
          {isEditMode ? (
            <Input
              id="harga_dasar"
              type="number"
              placeholder="Enter base price"
              {...register('harga_dasar')}
              className={inputStyle}
            />
          ) : (
            <div className="text-sm font-medium text-right h-[36px] px-2 py-2 border border-glass-border rounded-md bg-muted/10">
              Rp. {parseFloat(config.harga_dasar || '0').toLocaleString()}
            </div>
          )}
          {errors.harga_dasar && <p className="text-sm text-destructive">{errors.harga_dasar.message}</p>}
        </FormGroup>

        <FormGroup label="Price per Question" htmlFor="harga_per_pertanyaan">
          {isEditMode ? (
            <Input
              id="harga_per_pertanyaan"
              type="number"
              placeholder="Enter price per question"
              {...register('harga_per_pertanyaan')}
              className={inputStyle}
            />
          ) : (
            <div className="text-sm font-medium text-right h-[36px] px-2 py-2 border border-glass-border rounded-md bg-muted/10">
              Rp. {parseFloat(config.harga_per_pertanyaan || '0').toLocaleString()}
            </div>
          )}
          {errors.harga_per_pertanyaan && <p className="text-sm text-destructive">{errors.harga_per_pertanyaan.message}</p>}
        </FormGroup>

        <FormGroup label="Price per Respondent" htmlFor="harga_per_responden">
          {isEditMode ? (
            <Input
              id="harga_per_responden"
              type="number"
              placeholder="Enter price per respondent"
              {...register('harga_per_responden')}
              className={inputStyle}
            />
          ) : (
            <div className="text-sm font-medium text-right h-[36px] px-2 py-2 border border-glass-border rounded-md bg-muted/10">
              Rp. {parseFloat(config.harga_per_responden || '0').toLocaleString()}
            </div>
          )}
          {errors.harga_per_responden && <p className="text-sm text-destructive">{errors.harga_per_responden.message}</p>}
        </FormGroup>

        <FormGroup label="Price per Duration (days)" htmlFor="harga_per_durasi">
          {isEditMode ? (
            <Input
              id="harga_per_durasi"
              type="number"
              placeholder="Enter price per minute"
              {...register('harga_per_durasi')}
              className={inputStyle}
            />
          ) : (
            <div className="text-sm font-medium text-right h-[36px] px-2 py-2 border border-glass-border rounded-md bg-muted/10">
              Rp. {parseFloat(config.harga_per_durasi || '0').toLocaleString()}
            </div>
          )}
          {errors.harga_per_durasi && <p className="text-sm text-destructive">{errors.harga_per_durasi.message}</p>}
        </FormGroup>
      </div>

      <div className="col-span-full flex justify-end gap-3 pt-4">
        {isEditMode ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditMode(false)}
              disabled={isPending}
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 100%)',
              }}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="w-full text-background border border-glass-border transition backdrop-blur-md hover:opacity-80"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, var(--color-primary-2) 0%, var(--color-primary-1) 50%, var(--color-primary-3) 100%)',
            }}
          >
            Edit
          </Button>
        )}
      </div>
    </form>
  );
}
