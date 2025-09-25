import { Metadata } from 'next';
import { UnauthorizedPage } from '@/components/pages/errors/401';

export const metadata: Metadata = {
  title: 'Error - 401',
  description: 'Credentials are required to proceed',
};

export default function Unauthorized() {
  return <UnauthorizedPage />;
}
