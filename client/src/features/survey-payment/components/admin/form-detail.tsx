'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { useAdminSurveyPayment } from '../../hooks/useAdminSurveyPayment';

interface FormDetailSurveyPaymentProps {
  paymentId: string;
}

export const FormDetailSurveyPayment = ({ paymentId }: FormDetailSurveyPaymentProps) => {
  const {
    data: payment,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminSurveyPayment(paymentId);

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-grow justify-center items-center text-muted-foreground text-sm">
        Loading Data...
      </div>
    );
  }

  if (isError || !payment) {
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
      <FormGroup label="Survey Title" htmlFor="judul">
        <Input id="judul" value={payment.Survei?.judul || '[Deleted Survey]'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Payer Name" htmlFor="nama_pembayar">
        <Input id="nama_pembayar" value={payment.Umum?.nama || '[Deleted User]'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Payer Email" htmlFor="email">
        <Input id="email" value={payment.Umum?.Pengguna?.email || '[Deleted User]'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Invoice Amount" htmlFor="jumlah_tagihan">
        <Input
          id="jumlah_tagihan"
          value={`Rp ${Number(payment.jumlah_tagihan).toLocaleString('id-ID')}`}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Amount Paid" htmlFor="jumlah_dibayar">
        <Input
          id="jumlah_dibayar"
          value={`Rp ${Number(payment.jumlah_dibayar).toLocaleString('id-ID')}`}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Payment Method" htmlFor="metode">
        <Input id="metode" value={payment.metode_pembayaran || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Status" htmlFor="status">
        <Input
          id="status"
          value={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Created At" htmlFor="created_at">
        <Input id="created_at" value={new Date(payment.created_at).toLocaleString('id-ID')} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Last Updated" htmlFor="updated_at">
        <Input id="updated_at" value={new Date(payment.updated_at).toLocaleString('id-ID')} readOnly disabled className={inputStyle} />
      </FormGroup>
    </div>
  );
};
