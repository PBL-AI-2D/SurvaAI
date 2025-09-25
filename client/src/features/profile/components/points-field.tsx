'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { Coins } from 'lucide-react';

export default function PointField() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;
  const { profile, isLoading } = useProfile(shouldFetch);

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-md md:max-w-fit 
        border border-glass-border bg-glass-bg backdrop-blur-sm 
        bg-background/30 text-foreground placeholder:text-foreground/60 shadow-sm"
      style={{
        borderColor: 'var(--glass-border)',
      }}
    >
      <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
      <span className="text-sm font-medium truncate">
        {isLoading
          ? 'Loading...'
          : `Your points: ${parseInt(profile?.Umum?.poin ?? '0', 10).toLocaleString()}`}
      </span>
    </div>
  );
}
