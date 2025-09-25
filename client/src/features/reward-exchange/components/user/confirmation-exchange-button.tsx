'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useCreateRewardExchange } from '@/features/reward-exchange/hooks/useUserRewardExchange';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RewardExchangePreviewProps {
  idHadiah: string;
  hargaPoin: number;
  onSuccessClose?: () => void;
}

export default function RewardExchangePreview({
  idHadiah,
  hargaPoin,
  onSuccessClose,
}: RewardExchangePreviewProps) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;
  const { profile, isLoading } = useProfile(shouldFetch);
  const createExchange = useCreateRewardExchange();

  const currentPoin = parseInt(profile?.Umum?.poin ?? '0', 10);
  const remainingPoin = currentPoin - hargaPoin;
  const isNotEnough = remainingPoin < 0;

  const handleConfirm = () => {
    if (!idHadiah) return toast.error('Reward ID not found.');

    createExchange.mutate(
      { id_hadiah: idHadiah },
      {
        onSuccess: () => {
          toast.success('Reward successfully redeemed!');
          onSuccessClose?.();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'An error occurred while redeeming.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  return (
    <div
      className="space-y-4 p-4 rounded-lg border border-glass-border bg-glass-bg backdrop-blur-xl text-sm text-foreground"
      style={{
        background: 'var(--glass-background)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'var(--glass-blur)',
      }}
    >
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-medium">Your Points:</span>
          <span className="font-semibold">{currentPoin.toLocaleString()} pts</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Remaining After Redemption:</span>
          <span className={isNotEnough ? 'text-red-500 font-semibold' : 'font-semibold'}>
            {remainingPoin.toLocaleString()} pts
          </span>
        </div>
      </div>

      <Button
        onClick={handleConfirm}
        disabled={isNotEnough || createExchange.isPending}
        className="w-full text-sm font-semibold rounded-md px-4 py-2
          bg-secondary-1/50 dark:bg-secondary-1/40
          text-foreground hover:bg-secondary-1/40 dark:hover:bg-secondary-1/30 
          border border-glass-border backdrop-blur-md transition"
        style={{
          borderColor: 'var(--glass-border)',
        }}
      >
        {createExchange.isPending
          ? 'Processing...'
          : isNotEnough
          ? 'Insufficient Points'
          : 'Confirm Redemption'}
      </Button>
    </div>
  );
}
