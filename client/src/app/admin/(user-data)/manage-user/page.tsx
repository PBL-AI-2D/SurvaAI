import { Metadata } from 'next';
import { ManageUserPage } from '@/components/pages/admin/manage-user';

export const metadata: Metadata = {
  title: 'Data - Public',
  description: 'Manage application public data.',
};

export default function ManageUser() {
  return <ManageUserPage />;
}
