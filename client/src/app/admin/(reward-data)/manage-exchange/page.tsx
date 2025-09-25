import { Metadata } from 'next';
import { ManageRewardExchangePage } from '@/components/pages/admin/manage-exchange';

export const metadata: Metadata = {
  title: 'Data - Exchange Reward',
  description: 'Manage reward exchange records in the application.',
};

export default function ManageRewardExchange() {
  return <ManageRewardExchangePage />;
}
