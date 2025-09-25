import { Metadata } from 'next';
import { ManageSurveyPage } from '@/components/pages/main/manage-survey';

export const metadata: Metadata = {
  title: 'Surva. - Manage',
  description: 'Page to manage surveys owned by the user.',
};

export default function ManageSurvey() {
  return <ManageSurveyPage />;
}
