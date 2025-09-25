import { Metadata } from 'next';
import { ManageSurveyAddPage } from '@/components/pages/admin/manage-survey-add';

export const metadata: Metadata = {
  title: 'Data - Add Survey',
  description: 'Add new survey data to the application.',
};

export default function ManageSurveyAdd() {
  return <ManageSurveyAddPage />;
}
