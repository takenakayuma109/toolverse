'use client';

import PageLayout from '@/components/layout/PageLayout';
import BillingPage from '@/components/billing/BillingPage';

export default function BillingRoute() {
  return (
    <PageLayout currentPage="billing">
      <BillingPage />
    </PageLayout>
  );
}
