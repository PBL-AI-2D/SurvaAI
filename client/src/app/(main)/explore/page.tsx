import { Metadata } from 'next';
import { ExplorePage } from '@/components/pages/main/explore';

export const metadata: Metadata = {
  title: 'Surva. - Explore',
  description: 'Browse available surveys and start participating.',
};

export default function Explore() {
  return <ExplorePage />;
}
