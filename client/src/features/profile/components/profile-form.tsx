'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, SquareUserRound } from 'lucide-react';
import { ProfileFormField } from '@/components/umum/form/profile-form-field';
import { UserProfile } from '../types/types';
import { updateProfileForm } from '../hooks/useProfile';

interface ProfileFormProps {
  user?: UserProfile | null;
  isEditing: boolean;
  isPending: boolean;
  isLoadingUser: boolean;
  isError: boolean;
  onEditToggle: () => void;
  onSubmit: (data: updateProfileForm) => void;
  onRetry: () => void;
}

export function ProfileForm({
  user,
  isEditing,
  isPending,
  isLoadingUser,
  isError,
  onEditToggle,
  onSubmit,
  onRetry,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    region: '',
    status: '',
    nama_klien: '',
    kontak_klien: '',
    alamat_klien: '',
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      nama: user.Umum?.nama ?? '',
      tanggal_lahir: user.Umum?.profil_responden?.tanggal_lahir ?? '',
      jenis_kelamin: user.Umum?.profil_responden?.jenis_kelamin ?? '',
      region: user.Umum?.profil_responden?.region ?? '',
      status: user.Umum?.profil_responden?.status ?? '',
      nama_klien: user.Umum?.profil_klien?.nama_klien ?? '',
      kontak_klien: user.Umum?.profil_klien?.kontak_klien ?? '',
      alamat_klien: user.Umum?.profil_klien?.alamat_klien ?? '',
    });
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      umum: {
        nama: formData.nama,
        profil_responden: {
          tanggal_lahir: formData.tanggal_lahir,
          jenis_kelamin: formData.jenis_kelamin,
          region: formData.region,
          status: formData.status,
        },
        profil_klien: {
          nama_klien: formData.nama_klien,
          kontak_klien: formData.kontak_klien,
          alamat_klien: formData.alamat_klien,
        },
      },
    });
  };

  if (isLoadingUser) {
    return <div className="h-96 w-full animate-pulse rounded-md bg-muted" />;
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-100 px-4 py-6 rounded-lg">
        <p>Failed to load user profile.</p>
        <Button variant="destructive" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-base font-semibold text-foreground">Account</h3>
      <ProfileFormField label="Email" id="email" value={user.email ?? ''} readOnly />

      <Separator className="bg-foreground/30" />

      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <SquareUserRound  className="w-5 h-5" />
        Respondent Profile
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <ProfileFormField
          label="Name"
          id="nama"
          value={formData.nama}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <ProfileFormField
          label="Date of Birth"
          id="tanggal_lahir"
          type="date"
          value={formData.tanggal_lahir}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <ProfileFormField
          label="Gender"
          id="jenis_kelamin"
          type="select"
          value={formData.jenis_kelamin}
          onChange={handleChange}
          isEditing={isEditing}
          options={[
            { value: 'laki laki', label: 'Male' },
            { value: 'perempuan', label: 'Female' },
          ]}
        />
        <ProfileFormField
          label="Region"
          id="region"
          value={formData.region}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <ProfileFormField
          label="Status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      <Separator className="bg-foreground/30" />

      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Building2 className="w-5 h-5" />
        Client Profile
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <ProfileFormField
          label="Client Name"
          id="nama_klien"
          value={formData.nama_klien}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <ProfileFormField
          label="Client Contact"
          id="kontak_klien"
          value={formData.kontak_klien}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <ProfileFormField
          label="Client Address"
          id="alamat_klien"
          value={formData.alamat_klien}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      <Separator className="bg-foreground/30" />

      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <Button
              type="button"
              onClick={onEditToggle}
              variant="ghost"
              className="backdrop-blur-md bg-foreground/10 border border-glass-border text-foreground hover:bg-foreground/20 shadow-md"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="backdrop-blur-md bg-secondary-1/30 border border-secondary-1/40 text-foreground hover:bg-secondary-1/40 hover:border-secondary-1/50 transition-all duration-200 ease-in-out shadow-lg"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={onEditToggle}
            className="backdrop-blur-md bg-foreground/10 border border-glass-border text-foreground hover:bg-foreground/20 shadow-md"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </form>
  );
}
