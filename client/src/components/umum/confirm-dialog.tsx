'use client';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  actionClassName?: string;
}

export function ConfirmDialog({
  children,
  title = 'Confirm Action',
  description = 'This action cannot be undone.',
  actionLabel = 'Continue',
  isLoading = false,
  onConfirm,
  actionClassName = '',
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-xl text-foreground"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel
            className="px-4 py-2 rounded-md font-medium text-sm border border-glass-border 
              bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/40 hover:text-foreground transition"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition 
              bg-secondary-1/30 hover:bg-secondary-1/40 text-foreground border border-glass-border backdrop-blur-md 
              ${actionClassName}`}
            style={{ borderColor: 'var(--glass-border)' }}
          >
            {isLoading ? 'Processing...' : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
