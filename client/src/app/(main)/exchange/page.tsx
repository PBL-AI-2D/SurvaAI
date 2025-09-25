import { Metadata } from 'next';
import { ExchangePage } from '@/components/pages/main/exchange';

export const metadata: Metadata = {
  title: 'Surva. - Exchange',
  description: 'Exchange your earned points for available rewards.',
};

export default function Exchange() {
  return <ExchangePage />;
}
