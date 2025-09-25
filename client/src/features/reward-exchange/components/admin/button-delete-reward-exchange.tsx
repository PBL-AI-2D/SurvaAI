"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useAdminDeleteRewardExchange } from "../../hooks/useAdminRewardExchange";

interface ButtonDeleteRewardExchangeProps {
  rewardExchangeId: string;
  onSuccess?: () => void;
}

export const ButtonDeleteRewardExchange = ({
  rewardExchangeId,
  onSuccess,
}: ButtonDeleteRewardExchangeProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteRewardExchange, isPending } = useAdminDeleteRewardExchange();

  const handleDelete = async () => {
    try {
      await deleteRewardExchange(rewardExchangeId);
      toast.success("Reward exchange successfully deleted");
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete reward exchange");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-glass-border bg-glass-bg text-foreground backdrop-blur-md hover:bg-background hover:text-foreground">
          <Trash className="w-4 h-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Reward Exchange</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this reward exchange? This action cannot be undone.
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
  );
};
