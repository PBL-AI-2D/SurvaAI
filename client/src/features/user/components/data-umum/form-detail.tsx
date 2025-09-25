'use client';

import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/umum/form/form-group';
import { usePengguna } from '../../hooks/useUser';
import { Button } from '@/components/ui/button';

interface FormDetailUmumProps {
  userId: string;
}

export const FormDetailUmum = ({ userId }: FormDetailUmumProps) => {
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
  const umum = user.Umum;
  const responden = umum?.profil_responden;
  const klien = umum?.profil_klien;

  const inputStyle =
    'bg-transparent backdrop-blur-md border border-glass-border text-foreground placeholder:text-muted-foreground/50';

  return (
    <div className="flex-grow space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md">
      <FormGroup label="User Id" htmlFor="id">
        <Input id="id" value={user.id} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Umum Id" htmlFor="id_umum">
        <Input id="id_umum" value={umum?.id} readOnly disabled className={inputStyle} />
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

      <FormGroup label="Full Name" htmlFor="nama">
        <Input id="nama" value={umum?.nama || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Date of Birth" htmlFor="tanggal_lahir">
        <Input id="tanggal_lahir" value={responden?.tanggal_lahir || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <Input
          id="jenis_kelamin"
          value={
            responden?.jenis_kelamin === 'laki laki'
              ? 'Male'
              : responden?.jenis_kelamin === 'perempuan'
              ? 'Female'
              : 'All'
          }
          readOnly
          disabled
          className={inputStyle}
        />
      </FormGroup>

      <FormGroup label="Region" htmlFor="region">
        <Input id="region" value={responden?.region || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Occupation / Education Status" htmlFor="status">
        <Input id="status" value={responden?.status || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Client Name" htmlFor="nama_klien">
        <Input id="nama_klien" value={klien?.nama_klien || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Client Contact" htmlFor="kontak_klien">
        <Input id="kontak_klien" value={klien?.kontak_klien || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Client Address" htmlFor="alamat_klien">
        <Input id="alamat_klien" value={klien?.alamat_klien || '-'} readOnly disabled className={inputStyle} />
      </FormGroup>

      <FormGroup label="Points" htmlFor="poin">
        <Input id="poin" value={umum?.poin?.toString() || '0'} readOnly disabled className={inputStyle} />
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
