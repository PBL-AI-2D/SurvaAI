'use client';

import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/umum/form/form-group';
import { useAdminRewardExchange } from '../../hooks/useAdminRewardExchange';
import { Button } from '@/components/ui/button';

interface FormDetailRewardExchangeProps {
  rewardExchangeId: string;
}

export const FormDetailRewardExchange = ({
  rewardExchangeId,
}: FormDetailRewardExchangeProps) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminRewardExchange(rewardExchangeId);

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

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
      <FormGroup label="Reward Exchange Id" htmlFor="id">
        <Input
          id="id"
          value={data.id}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="User Name" htmlFor="nama_penukar">
        <Input
          id="nama_penukar"
          value={data.Umum?.nama || '[Deleted User]'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="User Email" htmlFor="email_pengguna">
        <Input
          id="email_pengguna"
          value={data.Umum?.Pengguna?.email || '[Deleted User]'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Total Points" htmlFor="total_poin">
        <Input
          id="total_poin"
          value={data.total_poin.toString()}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Note" htmlFor="keterangan">
        <Input
          id="keterangan"
          value={data.keterangan || '-'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Created At" htmlFor="created_at">
        <Input
          id="created_at"
          value={new Date(data.created_at).toLocaleString('en-US')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Last Updated" htmlFor="updated_at">
        <Input
          id="updated_at"
          value={new Date(data.updated_at).toLocaleString('en-US')}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>
    </div>
  );
};
