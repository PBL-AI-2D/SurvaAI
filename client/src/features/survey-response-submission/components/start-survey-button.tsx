'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useResponseSurveySubmissionDraft } from '../hooks/useUserSurveyResponseSubmission';

interface StartSurveyButtonProps {
  surveiId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
}

export function StartSurveyButton({
  surveiId,
  isOwner,
  isLoggedIn,
}: StartSurveyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: draft, isLoading: draftLoading, refetch } = useResponseSurveySubmissionDraft(
    surveiId,
    false
  );

  const handleStart = async () => {
    if (!isLoggedIn) {
      router.push(`/login`);
      toast.error('Please log in first to participate in the survey.');
      return;
    }

    if (isOwner) {
      toast.error('You cannot participate in your own survey.');
      return;
    }

    try {
      setLoading(true);

      const res = await refetch();
      if (!res.data || res.status !== 'success') {
        throw new Error('Failed to create or fetch survey draft.');
      }

      toast.success('Survey started.');
      router.push(`/survey/viewform/${surveiId}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || '';
      toast.error(message || 'Failed to start the survey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleStart}
      disabled={loading || draftLoading}
      className="px-6 py-2 rounded-md font-semibold text-base transition 
        backdrop-blur-md border border-glass-border text-foreground bg-background
        shadow-md hover:shadow-lg"
    >
      {loading ? 'Starting...' : 'Start Survey'}
    </Button>
  );
}
