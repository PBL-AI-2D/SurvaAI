import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/features/profile/types/types';

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  hydrated: boolean;
  isLoggingOut: boolean;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  setUser: (user: UserProfile | null) => void;
  setHydrated: () => void;
  setIsLoggingOut: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hydrated: false,
      isLoggingOut: false,
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null, user: null }),
      setUser: (user) => {
        if (!user) return set({ user: null });
        const { id, email, role, Admin, Umum } = user;
        set({ user: { id, email, role, Admin, Umum } });
      },
      setHydrated: () => set({ hydrated: true }),
      setIsLoggingOut: (status) => set({ isLoggingOut: status }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
