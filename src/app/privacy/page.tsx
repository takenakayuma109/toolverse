'use client';

import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <PageLayout>
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-violet-600 dark:text-violet-400 hover:underline mb-8"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: March 15, 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Data We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> name, email address, avatar, and authentication provider details when you create an account.</li>
              <li><strong>Usage data:</strong> tools you install, pages you visit, searches, and interactions with the Platform.</li>
              <li><strong>Payment data:</strong> billing details processed securely through Stripe. We do not store full credit card numbers on our servers.</li>
              <li><strong>Device and browser data:</strong> IP address, browser type, operating system, and referring URLs collected automatically via server logs.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve the Platform.</li>
              <li>To process transactions and send related billing information.</li>
              <li>To send service notifications such as security alerts and account updates.</li>
              <li>To personalize your experience, including tool recommendations.</li>
              <li>To detect and prevent fraud, abuse, and security incidents.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We may also use analytics cookies to understand how users interact with the Platform. You can control cookie preferences through your browser settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h2>
            <p>We share data with the following categories of third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Stripe:</strong> payment processing and billing management.</li>
              <li><strong>Authentication providers:</strong> Google, GitHub, and Apple for OAuth sign-in.</li>
              <li><strong>Tool developers:</strong> when you install or purchase a tool, the developer may receive your display name and email.</li>
              <li><strong>Analytics and infrastructure:</strong> hosting, logging, and monitoring services.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Your Rights (GDPR / CCPA)</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Request data portability in a machine-readable format.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@toolverse.dev" className="text-violet-600 dark:text-violet-400 hover:underline">privacy@toolverse.dev</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for up to 90 days for backup and compliance purposes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), secure credential storage, and regular security audits.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Contact</h2>
            <p>For questions or concerns about this Privacy Policy, contact our data protection team at <a href="mailto:privacy@toolverse.dev" className="text-violet-600 dark:text-violet-400 hover:underline">privacy@toolverse.dev</a>.</p>
          </section>
        </div>
      </main>
    </PageLayout>
  );
}
