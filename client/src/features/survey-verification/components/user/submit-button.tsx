'use client';

import { useUserSubmitSurveyVerification } from '@/features/survey-verification/hooks/useUserSurveyVerification';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/umum/confirm-dialog';

const SubmitButton = ({ surveiId }: { surveiId: string }) => {
  const { mutate, isPending } = useUserSubmitSurveyVerification(surveiId);

  return (
    <ConfirmDialog
      title="Submit Survey for Verification?"
      description="Once submitted, you won't be able to edit this survey. Make sure all data is accurate."
      actionLabel="Yes, Submit"
      isLoading={isPending}
      onConfirm={() => mutate(surveiId)}
      actionClassName="
        bg-primary-2/30 hover:bg-primary-2/50 
        text-foreground border border-glass-border 
        backdrop-blur-md shadow-sm transition"
    >
    <Button
      className="w-full sm:w-fit text-sm font-semibold rounded-md px-4 py-2 
        bg-primary-2/30 hover:bg-primary-2/50 
        text-foreground border border-glass-border 
        backdrop-blur-md shadow-md transition duration-200 ease-in-out 
        disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        backdropFilter: 'var(--glass-blur)',
        borderColor: 'var(--glass-border)',
      }}
      disabled={isPending}
    >
  {isPending ? 'Submitting...' : 'Submit for Verification'}
</Button>

    </ConfirmDialog>
  );
};

export default SubmitButton;
