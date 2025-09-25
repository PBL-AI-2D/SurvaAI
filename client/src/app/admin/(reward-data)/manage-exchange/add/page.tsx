import { Metadata } from 'next';
import { ManageRewardExchangeAddPage } from '@/components/pages/admin/manage-exchange-add';

export const metadata: Metadata = {
  title: 'Data - Add Exchange',
  description: 'Add a new reward exchange record to the application.',
};

export default function ManageSurveyAdd() {
  return <ManageRewardExchangeAddPage />;
}
