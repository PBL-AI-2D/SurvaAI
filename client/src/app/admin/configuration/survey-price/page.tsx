import { Metadata } from 'next';
import { ConfigurationSurveyPricePage } from '@/components/pages/admin/configuration-survey-price';

export const metadata: Metadata = {
  title: 'Configuration - Survey Price',
  description: 'Manage survey pricing settings for the application.',
};

export default function ManageAdmin() {
  return <ConfigurationSurveyPricePage />;
}
