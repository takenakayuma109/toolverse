import Link from 'next/link';

export const metadata = {
  title: 'Developer Program Agreement | Toolverse',
  description: 'Toolverse developer program agreement for tool publishers.',
};

export default function DeveloperAgreementPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-violet-600 dark:text-violet-400 hover:underline mb-8"
      >
        &larr; Back to Home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Developer Program Agreement
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Last updated: March 15, 2026
      </p>

      <div className="mt-10 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            1. Eligibility
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 18 years old or the age of majority in your jurisdiction.</li>
            <li>You must have a valid Toolverse account with a Creator profile.</li>
            <li>You must provide accurate identity and tax information as required.</li>
            <li>
              Organizations may register as developers through an authorized representative who
              has the authority to bind the organization to this agreement.
            </li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2. App Submission
          </h2>
          <p>
            Tools submitted to the Toolverse marketplace must include a valid service URL,
            a manifest file at <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm">/.well-known/toolverse.json</code>,
            complete metadata (name, description, icon, category), and accurate pricing
            information. All submissions must comply with these guidelines and applicable laws.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            3. Review Process
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All submitted tools undergo a review process before being published.</li>
            <li>Reviews typically take 3-5 business days.</li>
            <li>Toolverse may request changes or additional information during the review.</li>
            <li>
              Tools may be rejected for security concerns, policy violations, insufficient quality,
              or misleading content.
            </li>
            <li>
              Published tools are subject to ongoing monitoring. Toolverse reserves the right to
              unpublish tools that no longer meet platform standards.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            4. Revenue Share
          </h2>
          <p className="mb-3">
            Toolverse charges a <strong>15% platform fee</strong> on all paid transactions
            (one-time purchases and subscriptions). The remaining 85% is paid to the developer.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The platform fee covers payment processing, hosting infrastructure, discovery, and marketplace services.</li>
            <li>The fee is calculated on the gross transaction amount before any payment processor fees.</li>
            <li>Toolverse may adjust the platform fee with 60 days&apos; written notice to developers.</li>
            <li>
              Developers in the Early Creator tier may qualify for a reduced platform fee as
              specified in their tier agreement.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            5. Payment Terms
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payouts are processed monthly on the 1st of each month for the previous period&apos;s earnings.</li>
            <li>
              Developers must connect a Stripe Connect account to receive payouts. Alternative
              payout methods may be available in select regions.
            </li>
            <li>A minimum payout threshold of $50 USD (or equivalent) applies. Earnings below this threshold roll over to the next period.</li>
            <li>Developers are responsible for applicable taxes on their earnings.</li>
            <li>Refunded transactions are deducted from future payouts.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Content Guidelines
          </h2>
          <p className="mb-3">Tools must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contain malware, spyware, or any malicious code.</li>
            <li>Collect user data beyond what is necessary for the tool&apos;s stated functionality.</li>
            <li>Infringe on third-party intellectual property rights.</li>
            <li>Promote illegal activities, hate speech, or harassment.</li>
            <li>Misrepresent functionality or provide deceptive descriptions.</li>
            <li>Attempt to bypass Toolverse platform fees or payment systems.</li>
            <li>Include adult content without appropriate labeling and age-gating.</li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            7. Termination
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Either party may terminate this agreement at any time with 30 days&apos; written notice.
            </li>
            <li>
              Toolverse may immediately suspend or terminate a developer account for material
              violations of this agreement.
            </li>
            <li>
              Upon termination, all published tools will be unpublished. Existing paid users will
              retain access for the remainder of their billing period.
            </li>
            <li>
              Outstanding payouts will be processed within 60 days of termination, minus any
              pending refunds or chargebacks.
            </li>
          </ul>
        </section>

        <section className="border-t border-gray-200 dark:border-white/[0.06] pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By publishing a tool on Toolverse, you agree to be bound by this Developer Program
            Agreement and our{' '}
            <Link href="/terms" className="text-violet-600 dark:text-violet-400 hover:underline">
              Terms of Service
            </Link>
            . For questions, contact{' '}
            <a href="mailto:developers@toolverse.dev" className="text-violet-600 dark:text-violet-400 hover:underline">
              developers@toolverse.dev
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
