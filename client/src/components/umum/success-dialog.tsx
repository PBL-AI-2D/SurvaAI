'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function SuccessDialog({ open, message, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl gap-2 text-green-600 w-full">
            <CheckCircle className="w-10 h-10" />
            Success
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex text-lg justify-center">
          {message}
        </DialogDescription>
        <div className="flex justify-end pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className='cursor-pointer'
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
