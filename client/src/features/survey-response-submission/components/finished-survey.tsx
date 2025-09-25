'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleCheck } from 'lucide-react';

interface SurveyFinishScreenProps {
  points: string;
}

export function FinishedSurvey({ points }: SurveyFinishScreenProps) {
  const router = useRouter();

  return (
    <div
      className="flex flex-col flex-grow items-center justify-center"
    >
      <CircleCheck className="w-16 h-16 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">Thank you!</h1>
      <p className="text-muted-foreground mb-4">
        Your responses have been successfully submitted.
      </p>
      <p className="text-lg font-semibold text-foreground mb-6">
        You have earned <span className="text-green-600">{points}</span> points!
      </p>
      <Button
        onClick={() => router.push('/explore')}
        className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-6 py-2"
      >
        Back to Explore
      </Button>
    </div>
  );
}
