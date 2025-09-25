import { Metadata } from 'next';
import { NotFoundPage } from '@/components/pages/errors/404';

export const metadata: Metadata = {
  title: 'Error - 404',
  description: 'The requested page could not be found',
};

export default function NotFound() {
  return <NotFoundPage />;
}
