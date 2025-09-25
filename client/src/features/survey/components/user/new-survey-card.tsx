'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useCreateUserSurvey } from '@/features/survey/hooks/useUserSurveys';
import { defaultSurveyPayload } from '../../constant/constants';
import { toast } from 'sonner';

export const NewSurveyCard = () => {
  const router = useRouter();
  const createSurvey = useCreateUserSurvey();

  const handleClick = async () => {
    const toastId = toast.loading("Creating new survey...");
    try {
      const result = await createSurvey.mutateAsync(defaultSurveyPayload);
      toast.success("Survey created successfully!", { id: toastId });
      router.push(`/manage-survey/edit/${result.id}`);
    } catch (err) {
      toast.error("Failed to create survey", { id: toastId });
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="relative cursor-pointer overflow-hidden h-[240px] p-0 flex flex-col gap-0 
        border border-glass-border bg-glass-bg backdrop-blur-md shadow-lg transition hover:shadow-xl hover:scale-[1.02] 
        before:absolute before:inset-0 before:content-[''] before:pointer-events-none "
      style={{
        background: 'var(--glass-background)',
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'var(--glass-blur)',
      }}
    >
      <div
        className="flex-grow flex items-center justify-center relative"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(255, 200, 120, 0.1), transparent 70%)',
        }}
      >
        <Plus className="w-40 h-40 text-foreground/80" />
      </div>

      <CardContent
        className="h-14 px-4 py-3 text-center text-foreground font-semibold text-lg border-t border-glass-border"
        style={{
          backdropFilter: 'var(--glass-blur)',
          borderColor: 'var(--glass-border)',
        }}
      >
        New Survey
      </CardContent>
    </Card>
  );
};
