'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface QuestionStepperProps {
  questions: { id: string }[];
  currentStep: number;
  answers: Record<string, any>;
  onNavigate: (index: number) => void;
}

export function NumberListQuestions({
  questions,
  currentStep,
  answers,
  onNavigate,
}: QuestionStepperProps) {
  return (
    <div className="flex justify-center w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-[var(--glass-border)] text-foreground hover:bg-muted/40 rounded-lg px-4 py-2">
            <span className="block sm:hidden">Navigate</span>
            <span className="hidden sm:block">Question Navigation</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="max-h-40 md:w-160 sm:w-120 w-60 overflow-y-auto z-10 bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)] text-foreground rounded-xl p-4 shadow-lg">
          <div className="grid md:grid-cols-10 grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentStep;
              const isAnswered = answers[q.id];

              return (
                <Button
                  key={q.id}
                  size="sm"
                  variant="ghost"
                  className={`
                    text-xs font-medium px-0 py-2 rounded-md border transition-all
                    ${
                      isCurrent
                        ? 'bg-foreground/10 border-foreground text-foreground'
                        : isAnswered
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200/60 dark:hover:bg-green-800/60'
                          : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-muted-foreground hover:bg-muted/30'
                    }
                  `}
                  onClick={() => onNavigate(idx)}
                >
                  {idx + 1}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
