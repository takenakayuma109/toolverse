import type { Metadata } from 'next';
import MarketplacePage from '@/components/marketplace/MarketplacePage';

export const metadata: Metadata = {
  title: 'Discover Tools - Toolverse',
  description:
    'Browse and discover the best software tools, SaaS, AI, and automation solutions on Toolverse.',
};

export default function DiscoverPage() {
  return <MarketplacePage />;
}
