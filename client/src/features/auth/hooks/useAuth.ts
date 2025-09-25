'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../api/api';
import { LoginPayload } from '../types/types';
import { useAuthStore } from '../stores/store';
import { api } from '@/lib/api';
import { profileService } from '@/features/profile/api/api';

let channel: BroadcastChannel | null = null;
let isRefreshing = false;

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    accessToken,
    setAccessToken,
    clearAccessToken,
    user,
    setUser,
    hydrated,
    isLoggingOut,
    setIsLoggingOut,
  } = useAuthStore();

  const login = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: async (response) => {
      if (response.status === 'success' && response.data?.accessToken) {
        const token = response.data.accessToken;

        setAccessToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const profile = await profileService.getProfile();
          const user = profile.data;
          setUser(user);

          channel?.postMessage('login');

          switch (user.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'umum':
              router.push('/explore');
              break;
            default:
              router.push('/');
              break;
          }
        } catch {
          setError('Gagal memuat profil.');
        }
      } else {
        setError(response.message || 'Login gagal');
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(msg);
    },
  });

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch {
    } finally {
      router.push('/login');

      setTimeout(() => {
        clearAccessToken();
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        queryClient.clear();
        channel?.postMessage('logout');
        setIsLoggingOut(false);
      }, 500);

    // try {
    //   await authService.logout();
    // } catch {
    //   router.replace('/login');
    // } finally {
    //   clearAccessToken();
    //   setUser(null);
    //   delete api.defaults.headers.common['Authorization'];
    //   queryClient.clear();

    //   channel?.postMessage('logout');

    //   router.replace('/login');
    //   setIsLoggingOut(false);
    }
  };

  const refreshToken = async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token || isRefreshing) return;

    isRefreshing = true;
    try {
      const response = await authService.refreshToken();
      if (response.status === 'success' && response.data?.accessToken) {
        const newToken = response.data.accessToken;
        setAccessToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } else {
        await logout();
      }
    } catch {
      await logout();
    } finally {
      isRefreshing = false;
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    profileService
      .getProfile()
      .then((res) => setUser(res.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        refreshToken();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!channel) {
      channel = new BroadcastChannel('auth');
    }

    const handleMessage = async (event: MessageEvent) => {
      const type = event.data;

      if (type === 'logout') {
        clearAccessToken();
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        queryClient.clear();
        router.push('/login');
      }

      if (type === 'login') {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return;
        const parsed = JSON.parse(raw)?.state?.accessToken;
        if (!parsed) return;

        setAccessToken(parsed);
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed}`;

        try {
          const profile = await profileService.getProfile();
          setUser(profile.data);
        } catch {
          await logout();
        }
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel?.removeEventListener('message', handleMessage);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    loading,
    error,
    login: login.mutate,
    logout,
    refreshToken,
    setError,
    hydrated,
    isLoggingOut,
  };
};
