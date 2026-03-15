import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Toolverse',
  description: 'Toolverse platform terms of service.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-violet-600 dark:text-violet-400 hover:underline mb-8"
      >
        &larr; Back to Home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Last updated: March 15, 2026
      </p>

      <div className="mt-10 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Toolverse platform (&quot;Platform&quot;), you agree to be bound
            by these Terms of Service (&quot;Terms&quot;). If you do not agree, you may not use the
            Platform. We may update these Terms from time to time; continued use after changes
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2. Account Terms
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 16 years old to create an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate and complete information during registration.</li>
            <li>One person or entity may not maintain more than one account.</li>
            <li>
              You are responsible for all activity that occurs under your account, whether or not
              you authorized such activity.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            3. Developer Terms
          </h2>
          <p>
            Developers who publish tools on the Platform agree to the{' '}
            <Link href="/developer-agreement" className="text-violet-600 dark:text-violet-400 hover:underline">
              Developer Program Agreement
            </Link>
            . Developers are solely responsible for the functionality, security, and availability
            of their tools. Toolverse reserves the right to remove any tool that violates these
            Terms or applicable law.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            4. User Terms
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may use the Platform and installed tools only for lawful purposes.</li>
            <li>You must not attempt to reverse-engineer, copy, or redistribute tools without authorization.</li>
            <li>You must not interfere with the Platform infrastructure or other users&apos; access.</li>
            <li>You must not use automated systems to scrape or collect data from the Platform.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            5. Payment Terms
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Paid tools and subscriptions are billed through our payment processor, Stripe.</li>
            <li>All prices are displayed in the applicable currency and include any processing fees.</li>
            <li>Subscriptions renew automatically unless cancelled before the renewal date.</li>
            <li>Refunds are handled on a case-by-case basis and are at the discretion of the tool developer and Toolverse.</li>
            <li>Toolverse charges a 15% platform fee on all paid tool transactions.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Intellectual Property
          </h2>
          <p>
            The Toolverse name, logo, and platform design are the intellectual property of
            Toolverse. Tools published on the Platform remain the intellectual property of their
            respective developers. Users may not reproduce, distribute, or create derivative works
            from Platform content without express permission.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            7. Limitation of Liability
          </h2>
          <p>
            Toolverse provides the Platform &quot;as is&quot; without warranties of any kind, whether
            express or implied. To the fullest extent permitted by law, Toolverse shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages, or
            any loss of profits or revenue, whether incurred directly or indirectly. Our total
            liability for any claim arising from these Terms shall not exceed the amount you paid
            to Toolverse in the twelve (12) months preceding the claim.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            8. Termination
          </h2>
          <p>
            Toolverse may suspend or terminate your account at any time for violation of these
            Terms or for any reason with reasonable notice. Upon termination, your right to access
            the Platform ceases immediately. Provisions that by their nature should survive
            termination (including liability limitations and intellectual property rights) will
            continue to apply.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            9. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Japan,
            without regard to its conflict-of-law provisions. Any disputes arising under these
            Terms shall be resolved in the courts of Tokyo, Japan.
          </p>
        </section>

        <section className="border-t border-gray-200 dark:border-white/[0.06] pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you have questions about these Terms, contact us at{' '}
            <a href="mailto:legal@toolverse.dev" className="text-violet-600 dark:text-violet-400 hover:underline">
              legal@toolverse.dev
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
