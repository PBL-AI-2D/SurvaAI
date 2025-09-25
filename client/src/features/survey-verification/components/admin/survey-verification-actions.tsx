'use client';

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useVerifySurveiByAdmin } from "../../hooks/useAdminSurveyVerification";
import { useRouter } from "next/navigation";

interface Props {
  surveyId: string;
}

export const SurveyVerificationActions = ({ surveyId }: Props) => {
  const [openReject, setOpenReject] = useState(false);
  const [openAccept, setOpenAccept] = useState(false);
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  const { mutate: verifySurvey, isPending } = useVerifySurveiByAdmin();

  const handleApprove = () => {
    verifySurvey(
      {
        id: surveyId,
        payload: { approve: true },
      },
      {
        onSuccess: () => {
          toast.success("Survey approved successfully.");
          setOpenAccept(false);
          router.push("/admin/manage-verification");
        },
        onError: () => toast.error("Failed to approve survey."),
      }
    );
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      toast.error("Rejection feedback is required.");
      return;
    }

    verifySurvey(
      {
        id: surveyId,
        payload: {
          approve: false,
          umpan_balik: feedback,
        },
      },
      {
        onSuccess: () => {
          toast.success("Survey rejected.");
          setOpenReject(false);
          setFeedback("");
          router.push("/admin/manage-verification");
        },
        onError: () => toast.error("Failed to reject survey."),
      }
    );
  };

  return (
    <div className="flex gap-2 w-full">
      <AlertDialog open={openAccept} onOpenChange={setOpenAccept}>
        <AlertDialogTrigger asChild>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
          >
            Approve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this survey?</AlertDialogTitle>
            <AlertDialogDescription>
              The survey will be approved and can be published by the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
            >
              Yes, Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openReject} onOpenChange={setOpenReject}>
        <AlertDialogTrigger asChild>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
          >
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this survey?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason that will be sent to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            required
            className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
            >
              Submit Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
