import { AnalysisSurveyPage } from '@/components/pages/main/analysis-survey'
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shortId = id.slice(0, 8);
  return {
    title: `Surva. - Analysis Survey #${shortId}`,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AnalysisSurveyPage surveyId={id} />;
}
