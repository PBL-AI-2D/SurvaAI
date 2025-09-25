import { Metadata } from 'next';
import { ManageRewardAddPage } from '@/components/pages/admin/manage-reward-add';

export const metadata: Metadata = {
  title: 'Data - Add Reward',
  description: 'Add new reward data to the application.',
};

export default function ManageSurveyAdd() {
  return <ManageRewardAddPage />;
}
