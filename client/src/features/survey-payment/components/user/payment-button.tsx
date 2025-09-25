'use client';

import { useCreateSurveyPayment } from '@/features/survey-payment/hooks/useUserSurveyPayment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  surveyId: string;
}

export const CreateSurveyPaymentButton = ({ surveyId }: Props) => {
  const { mutate, isPending } = useCreateSurveyPayment();

  const handleClick = () => {
    mutate(surveyId, {
      onSuccess: (payment) => {
        if (payment.invoice_url) {
          window.open(payment.invoice_url, '_blank');
        } else {
          toast.error('No invoice URL found.');
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to create payment.');
      },
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="w-full sm:w-fit px-4 py-2 text-sm font-semibold rounded-md transition 
        bg-secondary-1/30 dark:bg-secondary-1/20 text-foreground hover:bg-secondary-1/40 dark:hover:bg-secondary-1/30 
        border border-glass-border backdrop-blur-md shadow-sm"
      style={{
        borderColor: 'var(--glass-border)',
      }}
    >
      {isPending ? 'Processing...' : 'Pay & Publish Survey'}
    </Button>
  );
};
