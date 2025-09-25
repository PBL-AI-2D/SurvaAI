import { Metadata } from 'next';
import { ManagePaymentPage } from '@/components/pages/admin/manage-payment';

export const metadata: Metadata = {
  title: 'Data - Payment Survey',
  description: 'Manage survey payment data within the application.',
};

export default function ManagePayment() {
  return <ManagePaymentPage />;
}
