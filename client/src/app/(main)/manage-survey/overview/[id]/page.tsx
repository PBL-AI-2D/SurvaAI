import { SurveyOverviewPage } from '@/components/pages/main/survey-overview';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shortId = id.slice(0, 8);
  return {
    title: `Surva. - Overview Survey #${shortId}`,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <SurveyOverviewPage surveyId={id} />;
}
