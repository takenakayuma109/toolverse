import type { Metadata } from 'next';
import BillingPage from '@/components/billing/BillingPage';

export const metadata: Metadata = {
  title: 'Billing - Toolverse',
  description:
    'Manage your subscriptions, payments, and billing settings on Toolverse.',
};

export default function BillingRoute() {
  return <BillingPage />;
}
