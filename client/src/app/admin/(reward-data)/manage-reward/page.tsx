import { Metadata } from 'next';
import { ManageRewardPage } from '@/components/pages/admin/manage-reward';

export const metadata: Metadata = {
  title: 'Data - Reward',
  description: 'Manage application reward data.',
};

export default function ManageReward() {
  return <ManageRewardPage />;
}
