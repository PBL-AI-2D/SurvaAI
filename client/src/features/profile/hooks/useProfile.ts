'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { profileService } from '../api/api';
import { UserProfile } from '../types/types';

export interface updateProfileForm {
  umum: {
    nama: string;
    profil_responden: {
      tanggal_lahir: string;
      jenis_kelamin: string;
      region: string;
      status: string;
    };
    profil_klien: {
      nama_klien: string;
      kontak_klien: string;
      alamat_klien: string;
    };
  };
}

export const useProfile = (enabled = true) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = (err: unknown, fallback = 'Terjadi kesalahan') => {
    const message =
      (err as any)?.response?.data?.message ||
      (err as Error)?.message ||
      fallback;
    setErrorMessage(message);
  };

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await profileService.getProfile();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  const updateProfile = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err) => handleError(err, 'Gagal memperbarui profil'),
  });

  const clearError = () => {
    setErrorMessage(null);
    updateProfile.reset();
  };

  return {
    profile,
    isLoading,
    isError,
    error,
    refetch,
    errorMessage,
    clearError,
    updateProfile: {
      mutate: updateProfile.mutate,
      isPending: updateProfile.isPending,
    },
  };
};
