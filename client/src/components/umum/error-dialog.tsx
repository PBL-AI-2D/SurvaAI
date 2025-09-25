'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorDialogProps {
  open: boolean
  message: string
  onClose: () => void
}

export function ErrorDialog({ open, message, onClose }: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex text-3xl justify-center gap-2 text-red-600 w-full">
            <AlertCircle className="w-10 h-10" />
            Error
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex text-lg justify-center">
          {message}
        </DialogDescription>
        <div className="flex justify-end pt-2">
          <Button
            onClick={onClose}
            variant="destructive"
            className='cursor-pointer'
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
