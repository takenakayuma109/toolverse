'use client';

import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

export default function DeveloperAgreementPage() {
  return (
    <PageLayout>
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm text-violet-600 dark:text-violet-400 hover:underline mb-8">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Developer Program Agreement</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Last updated: March 15, 2026</p>
        <div className="mt-10 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Eligibility</h2><ul className="list-disc pl-6 space-y-2"><li>You must be at least 18 years old or the age of majority in your jurisdiction.</li><li>You must have a valid Toolverse account with a Creator profile.</li><li>You must provide accurate identity and tax information as required.</li></ul></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. App Submission</h2><p>Tools submitted to the Toolverse marketplace must include a valid service URL, a manifest file, complete metadata, and accurate pricing information.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Review Process</h2><ul className="list-disc pl-6 space-y-2"><li>All submitted tools undergo a review process before being published.</li><li>Reviews typically take 3-5 business days.</li><li>Tools may be rejected for security concerns, policy violations, or insufficient quality.</li></ul></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Revenue Share</h2><p>Toolverse charges a <strong>15% platform fee</strong> on all paid transactions. The remaining 85% is paid to the developer.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Payment Terms</h2><ul className="list-disc pl-6 space-y-2"><li>Payouts are processed monthly on the 1st of each month.</li><li>Developers must connect a Stripe Connect account to receive payouts.</li><li>A minimum payout threshold of $50 USD applies.</li></ul></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Content Guidelines</h2><p>Tools must not contain malware, collect excessive data, infringe IP rights, promote illegal activities, or misrepresent functionality.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Termination</h2><p>Either party may terminate this agreement at any time with 30 days&apos; written notice. Outstanding payouts will be processed within 60 days of termination.</p></section>
          <section className="border-t border-gray-200 dark:border-white/[0.06] pt-8"><p className="text-sm text-gray-500 dark:text-gray-400">By publishing a tool on Toolverse, you agree to be bound by this agreement and our <Link href="/terms" className="text-violet-600 dark:text-violet-400 hover:underline">Terms of Service</Link>. For questions, contact <a href="mailto:developers@toolverse.dev" className="text-violet-600 dark:text-violet-400 hover:underline">developers@toolverse.dev</a>.</p></section>
        </div>
      </main>
    </PageLayout>
  );
}
