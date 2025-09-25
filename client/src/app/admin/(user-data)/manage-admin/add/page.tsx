import { Metadata } from 'next';
import { ManageAdminAddPage } from '@/components/pages/admin/manage-admin-add';

export const metadata: Metadata = {
  title: 'Data - Add Admin',
  description: 'Add new admin data to the application.',
};

export default function ManageAdminAdd() {
  return <ManageAdminAddPage />;
}
