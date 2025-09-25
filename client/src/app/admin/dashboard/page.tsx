import { Metadata } from 'next';
import { DashboardAdminPage } from '@/components/pages/admin/dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'The administrative panel for managing application content and settings.',
};

export default function DashboardAdmin() {
  return <DashboardAdminPage />;
}
