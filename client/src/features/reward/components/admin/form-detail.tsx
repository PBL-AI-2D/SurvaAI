'use client'

import { Input } from '@/components/ui/input'
import { FormGroup } from '@/components/umum/form/form-group'
import { useAdminHadiah } from '../../hooks/useAdminReward'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface FormDetailRewardProps {
  rewardId: string
}

export const FormDetailReward = ({ rewardId }: FormDetailRewardProps) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminHadiah(rewardId)

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50'

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
    <div className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <FormGroup label="Reward Id" htmlFor="id">
        <Input id="id" value={data.id} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Reward Name" htmlFor="nama">
        <Input id="nama" value={data.nama} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Description" htmlFor="deskripsi">
        <Input id="deskripsi" value={data.deskripsi || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Stock" htmlFor="stok">
        <Input id="stok" value={data.stok.toString()} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Point Price" htmlFor="harga_poin">
        <Input id="harga_poin" value={`${data.harga_poin} points`} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Created At" htmlFor="created_at">
        <Input
          id="created_at"
          value={new Date(data.created_at).toLocaleString('id-ID')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Last Updated" htmlFor="updated_at">
        <Input
          id="updated_at"
          value={new Date(data.updated_at).toLocaleString('id-ID')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>
    </div>
  )
}
