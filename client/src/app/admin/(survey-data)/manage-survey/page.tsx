import { Metadata } from 'next';
import { ManageSurveyPage } from '@/components/pages/admin/manage-survey';

export const metadata: Metadata = {
  title: 'Data - Survey',
  description: 'Manage application survey data.',
};

export default function ManageSurvey() {
  return <ManageSurveyPage />;
}
