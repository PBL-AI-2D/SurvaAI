import { Metadata } from 'next';
import { ForbiddenPage } from '@/components/pages/errors/403';

export const metadata: Metadata = {
  title: 'Error - 403',
  description: 'You do not have access to this page',
};

export default function Forbidden() {
  return <ForbiddenPage />;
}
