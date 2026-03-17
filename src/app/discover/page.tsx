'use client';

import PageLayout from '@/components/layout/PageLayout';
import MarketplacePage from '@/components/marketplace/MarketplacePage';

export default function DiscoverPage() {
  return (
    <PageLayout currentPage="discover">
      <MarketplacePage />
    </PageLayout>
  );
}
