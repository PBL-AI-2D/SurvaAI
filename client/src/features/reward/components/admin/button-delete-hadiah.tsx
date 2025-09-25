"use client"

import { useState } from "react"
import { Trash } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { useAdminDeleteHadiah } from "../../hooks/useAdminReward"

interface ButtonDeleteHadiahProps {
  hadiahId: string
  onSuccess?: () => void
}

export const ButtonDeleteHadiah = ({
  hadiahId,
  onSuccess,
}: ButtonDeleteHadiahProps) => {
  const [open, setOpen] = useState(false)
  const { mutateAsync: deleteHadiah, isPending } = useAdminDeleteHadiah()

  const handleDelete = async () => {
    try {
      await deleteHadiah(hadiahId)
      toast.success("Reward deleted successfully.")
      setOpen(false)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete reward.")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="flex items-center justify-center bg-muted hover:bg-background">
          <Trash className="w-4 h-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Reward</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this reward? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
