'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/api';
import { CompleteAccountPayload, EmailRegisterPayload, VerifyOtpPayload } from '../types/types';

type RegisterStep = 'init' | 'verify' | 'complete';

export interface RegisterForm {
  nama_lengkap: string;
  password: string;
  konfirmasi_password: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  region: string;
  status: string;
}

export const useRegister = () => {
  const router = useRouter();

  const [step, setStep] = useState<RegisterStep>('init');
  const [email, setEmail] = useState('');
  const [registerToken, setRegisterToken] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = (err: unknown, fallback = 'Terjadi kesalahan') => {
    const message =
      (err as any)?.response?.data?.message ||
      (err as Error)?.message ||
      fallback;
    setErrorMessage(message);
  };

  const emailRegister = useMutation({
    mutationFn: (payload: EmailRegisterPayload) => authService.emailRegister(payload),
    onSuccess: (res) => {
      if (res.status === 'success') {
        setEmail(res.data?.email ?? '');
        setStep('verify');
      } else {
        setErrorMessage(res.message || 'Gagal mengirim OTP');
      }
    },
    onError: (err) => handleError(err, 'Gagal mengirim OTP'),
  });

  const resendOtp = useMutation<void, Error, EmailRegisterPayload>({
    mutationFn: (payload) => authService.emailRegister(payload).then(() => {}),
    onError: (err) => handleError(err, 'Gagal mengirim ulang kode'),
  });

  const verifyOtp = useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
    onSuccess: (res) => {
      if (res.status === 'success') {
        setRegisterToken(res.data?.register_token ?? '');
        setStep('complete');
      } else {
        setErrorMessage(res.message || 'OTP tidak valid');
      }
    },
    onError: (err) => handleError(err, 'Gagal verifikasi OTP'),
  });

  const completeAccount = useMutation({
    mutationFn: async (form: RegisterForm) => {
      if (form.password !== form.konfirmasi_password) {
        throw new Error('Password dan konfirmasi password tidak sama');
      }

      const payload: CompleteAccountPayload = {
        register_token: registerToken,
        password: form.password,
        nama: form.nama_lengkap,
        profil_responden: {
          tanggal_lahir: form.tanggal_lahir,
          status: form.status,
          region: form.region,
          jenis_kelamin: form.jenis_kelamin,
        },
      };

      return authService.completeAccount(payload);
    },
    onSuccess: (res) => {
      if (res.status === 'success') {
        router.push('/login');
      } else {
        setErrorMessage(res.message || 'Gagal menyelesaikan pendaftaran');
      }
    },
    onError: (err) => handleError(err, 'Gagal menyelesaikan pendaftaran'),
  });

  const clearError = () => {
    setErrorMessage(null);
    emailRegister.reset();
    resendOtp.reset();
    verifyOtp.reset();
    completeAccount.reset();
  };

  return {
    step,
    email,
    setStep,
    clearError,
    errorMessage,
    emailRegister: {
      mutate: emailRegister.mutate,
      isPending: emailRegister.isPending,
    },
    verifyOtp: {
      mutate: verifyOtp.mutate,
      isPending: verifyOtp.isPending,
    },
    resendOtp: {
      mutateAsync: resendOtp.mutateAsync,
      isPending: resendOtp.isPending,
    },
    completeAccount: {
      mutate: completeAccount.mutate,
      mutateAsync: completeAccount.mutateAsync,
      isPending: completeAccount.isPending,
    },
  };
};
