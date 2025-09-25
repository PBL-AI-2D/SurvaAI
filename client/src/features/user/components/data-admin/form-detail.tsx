'use client';

import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/umum/form/form-group';
import { usePengguna } from '../../hooks/useUser';
import { Button } from '@/components/ui/button';

interface FormDetailAdminProps {
  userId: string;
}

export const FormDetailAdmin = ({ userId }: FormDetailAdminProps) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = usePengguna(userId);

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

  const user = data.data;
  const admin = user.Admin;

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  return (
    <div className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <FormGroup label="User Id" htmlFor="id">
        <Input id="id" value={user.id} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Admin Id" htmlFor="id_admin">
        <Input id="id_admin" value={admin?.id} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Email" htmlFor="email">
        <Input id="email" value={user.email} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Email Status" htmlFor="email_confirmed">
        <Input 
          id="email_confirmed" 
          value={user.email_confirmed ? 'Verified' : 'Not verified'} 
          readOnly 
          disabled 
          className={inputStyle} 
        />
      </FormGroup>

      <FormGroup label="Email Confirmation Token" htmlFor="email_confirmation_token">
        <Input id="email_confirmation_token" value={user.email_confirmation_token || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Email Confirmation Sent Time" htmlFor="email_confirmation_sent_at">
        <Input id="email_confirmation_sent_at" value={user.email_confirmation_sent_at || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Reauth Token" htmlFor="reauth_token">
        <Input id="reauth_token" value={user.reauth_token || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Reauth Sent Time" htmlFor="reauth_sent_at">
        <Input id="reauth_sent_at" value={user.reauth_sent_at || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Last Sign In" htmlFor="last_sign_in_at">
        <Input id="last_sign_in_at" value={user.last_sign_in_at || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Role" htmlFor="role">
        <Input id="role" value={user.role} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Admin Name" htmlFor="nama_admin">
        <Input
          id="nama_admin"
          value={admin?.nama_admin || '-'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Emergency Contact" htmlFor="kontak_darurat">
        <Input
          id="kontak_darurat"
          value={admin?.kontak_darurat || '-'}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Created At" htmlFor="created_at">
        <Input
          id="created_at"
          value={new Date(user.created_at).toLocaleString()}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Last Updated" htmlFor="updated_at">
        <Input
          id="updated_at"
          value={new Date(user.updated_at).toLocaleString()}
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>
    </div>
  );
};
