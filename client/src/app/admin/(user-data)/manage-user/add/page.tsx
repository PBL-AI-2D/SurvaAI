import { Metadata } from 'next';
import { ManageUserAddPage } from '@/components/pages/admin/manage-user-add';

export const metadata: Metadata = {
  title: 'Data - Add Public',
  description: 'Add new public data to the application.',
};

export default function ManageAdminAdd() {
  return <ManageUserAddPage />;
}
