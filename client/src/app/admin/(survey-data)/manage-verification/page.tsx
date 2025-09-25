import { Metadata } from 'next';
import { ManageVerificationPage } from '@/components/pages/admin/manage-verification';

export const metadata: Metadata = {
  title: 'Data - Verification Survey',
  description: 'Verify survey data in the application.',
};

export default function ManageVerification() {
  return <ManageVerificationPage />;
}
