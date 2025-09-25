import { SurveyViewForm } from '@/features/survey-response-submission/components/survey-viewform';

interface SurveyViewFormPageProps {
  surveyId: string;
}

export default function SurveyViewFormPage({ surveyId }: SurveyViewFormPageProps) {
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-20 pb-5 md:px-10 px-5">
      <div
        className="flex flex-col flex-grow w-full p-5 rounded-xl border shadow-sm bg-glass-bg backdrop-blur-xl border-glass-border"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <SurveyViewForm surveiId={surveyId} />
      </div>
    </main>
  );
}
