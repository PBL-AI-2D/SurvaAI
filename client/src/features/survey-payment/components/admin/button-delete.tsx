'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useDeleteAdminSurveyPayment } from '../../hooks/useAdminSurveyPayment';
import { Trash } from 'lucide-react';

interface ButtonDeleteSurveyPaymentProps {
  paymentId: string;
  onSuccess?: () => void;
}

export const ButtonDeleteSurveyPayment = ({
  paymentId,
  onSuccess,
}: ButtonDeleteSurveyPaymentProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deletePayment, isPending } = useDeleteAdminSurveyPayment();

  const handleDelete = async () => {
    try {
      await deletePayment(paymentId);
      toast.success('Survey payment successfully deleted');
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete survey payment');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="flex items-center justify-center bg-muted hover:bg-background">
          <Trash className="w-4 h-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Survey Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this payment record? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
