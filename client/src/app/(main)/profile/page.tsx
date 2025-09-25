import { Metadata } from 'next';
import { ProfilePage } from '@/components/pages/main/profile';

export const metadata: Metadata = {
  title: 'User Profile',
  description: 'View your user account profile information.',
};

export default function Profile() {
  return <ProfilePage />;
}
