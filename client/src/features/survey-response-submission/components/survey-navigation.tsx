'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NumberListQuestions } from './number-list-questions';
import { CheckCheck } from 'lucide-react';

interface Question {
  id: string;
  teks_pertanyaan: string;
  is_required: boolean;
}

interface SurveyNavigationProps {
  questions: Question[];
  currentStep: number;
  setCurrentStep: (index: number) => void;
  answers: Record<string, any>;
  onSubmit: () => void;
}

export function SurveyNavigation({
  questions,
  currentStep,
  setCurrentStep,
  answers,
  onSubmit,
}: SurveyNavigationProps) {
  const [open, setOpen] = useState(false);

  const requiredUnanswered = questions.filter(
    (q) => q.is_required && !answers[q.id]
  );
  const optionalUnanswered = questions.filter(
    (q) => !q.is_required && !answers[q.id]
  );

  const isFinalStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;
  const isDisabled = requiredUnanswered.length > 0;

  const handleNext = () => {
    if (!isFinalStep) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (!isFirstStep) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex justify-between items-center gap-2">
        <Button
          onClick={handlePrev}
          className="sm:w-full max-w-[120px]
            bg-background/80
            text-foreground hover:bg-foreground/40 dark:hover:bg-foreground/30 
            border border-glass-border backdrop-blur-md transition
          "
          disabled={isFirstStep}
        >
          <span className="block sm:hidden">&lt;</span>
          <span className="hidden sm:block">&lt; Previous</span>
        </Button>

        <NumberListQuestions
          questions={questions}
          currentStep={currentStep}
          answers={answers}
          onNavigate={(idx) => setCurrentStep(idx)}
        />

        {!isFinalStep ? (
          <Button
            onClick={handleNext}
            className="sm:w-full max-w-[120px]
              bg-background/80
              text-foreground hover:bg-foreground/40 dark:hover:bg-foreground/30 
              border border-glass-border backdrop-blur-md transition
            "
          >
            <span className="block sm:hidden">&gt;</span>
            <span className="hidden sm:block">Next &gt;</span>
          </Button>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="sm:w-full max-w-[120px]
                  bg-secondary-1/80 text-foreground hover:bg-secondary-1/50 
                  border border-glass-border backdrop-blur-md transition
                "
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) setOpen(true);
                }}
              >
                <span className="flex items-center gap-1 sm:hidden"><CheckCheck /></span>
                <span className="hidden sm:flex items-center gap-1">Finish <CheckCheck /></span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-xl border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Are you sure you want to submit?
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  You won’t be able to change your answers after submission.
                </DialogDescription>
              </DialogHeader>

              {isDisabled ? (
                <p className="text-destructive font-medium text-sm">
                  ⚠️ {requiredUnanswered.length} required question(s) are still unanswered.
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  All required questions are answered. You can skip optional ones.
                </p>
              )}

              {optionalUnanswered.length > 0 && (
                <ul className="mt-3 list-disc list-inside max-h-32 overflow-auto text-sm text-muted-foreground">
                  <li className="font-medium mb-1 text-foreground/80">Optional questions not yet answered:</li>
                  {optionalUnanswered.map((q) => (
                    <li key={q.id}>{q.teks_pertanyaan}</li>
                  ))}
                </ul>
              )}

              <DialogFooter className="mt-6">
                <Button
                  className="px-4 py-2 rounded-md font-medium text-sm border border-glass-border 
                    bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/40 hover:text-foreground transition
                  "
                  style={{ borderColor: 'var(--glass-border)' }}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false);
                    onSubmit();
                  }}
                  className="bg-secondary-1 hover:bg-secondary-1/80 text-[#232323]"
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
