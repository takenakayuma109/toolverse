export type ChecklistCategory =
  | 'security'
  | 'performance'
  | 'content'
  | 'privacy'
  | 'technical'
  | 'business';

export interface ChecklistItem {
  /** Unique identifier for this checklist item */
  id: string;
  /** Category the item belongs to */
  category: ChecklistCategory;
  /** i18n key for the item title */
  titleKey: string;
  /** i18n key for the item description */
  descKey: string;
  /** Whether this item must be satisfied before submission */
  required: boolean;
  /** Whether this item is verified automatically by the platform */
  automated: boolean;
}

export const REVIEW_CHECKLIST_ITEMS: ChecklistItem[] = [
  // ── Security ──────────────────────────────────────────────
  {
    id: 'sec-https',
    category: 'security',
    titleKey: 'studio.checklist.secHttpsTitle',
    descKey: 'studio.checklist.secHttpsDesc',
    required: true,
    automated: true,
  },
  {
    id: 'sec-csp',
    category: 'security',
    titleKey: 'studio.checklist.secCspTitle',
    descKey: 'studio.checklist.secCspDesc',
    required: true,
    automated: true,
  },
  {
    id: 'sec-no-plaintext',
    category: 'security',
    titleKey: 'studio.checklist.secNoPlaintextTitle',
    descKey: 'studio.checklist.secNoPlaintextDesc',
    required: true,
    automated: false,
  },

  // ── Performance ───────────────────────────────────────────
  {
    id: 'perf-load-time',
    category: 'performance',
    titleKey: 'studio.checklist.perfLoadTimeTitle',
    descKey: 'studio.checklist.perfLoadTimeDesc',
    required: true,
    automated: true,
  },
  {
    id: 'perf-lighthouse',
    category: 'performance',
    titleKey: 'studio.checklist.perfLighthouseTitle',
    descKey: 'studio.checklist.perfLighthouseDesc',
    required: true,
    automated: true,
  },

  // ── Content ───────────────────────────────────────────────
  {
    id: 'content-accurate-desc',
    category: 'content',
    titleKey: 'studio.checklist.contentAccurateDescTitle',
    descKey: 'studio.checklist.contentAccurateDescDesc',
    required: true,
    automated: false,
  },
  {
    id: 'content-screenshots',
    category: 'content',
    titleKey: 'studio.checklist.contentScreenshotsTitle',
    descKey: 'studio.checklist.contentScreenshotsDesc',
    required: true,
    automated: false,
  },
  {
    id: 'content-no-illegal',
    category: 'content',
    titleKey: 'studio.checklist.contentNoIllegalTitle',
    descKey: 'studio.checklist.contentNoIllegalDesc',
    required: true,
    automated: false,
  },

  // ── Privacy ───────────────────────────────────────────────
  {
    id: 'privacy-policy-url',
    category: 'privacy',
    titleKey: 'studio.checklist.privacyPolicyUrlTitle',
    descKey: 'studio.checklist.privacyPolicyUrlDesc',
    required: true,
    automated: true,
  },
  {
    id: 'privacy-data-deletion',
    category: 'privacy',
    titleKey: 'studio.checklist.privacyDataDeletionTitle',
    descKey: 'studio.checklist.privacyDataDeletionDesc',
    required: true,
    automated: false,
  },
  {
    id: 'privacy-gdpr-ccpa',
    category: 'privacy',
    titleKey: 'studio.checklist.privacyGdprCcpaTitle',
    descKey: 'studio.checklist.privacyGdprCcpaDesc',
    required: true,
    automated: false,
  },

  // ── Technical ─────────────────────────────────────────────
  {
    id: 'tech-health-check',
    category: 'technical',
    titleKey: 'studio.checklist.techHealthCheckTitle',
    descKey: 'studio.checklist.techHealthCheckDesc',
    required: true,
    automated: true,
  },
  {
    id: 'tech-valid-service-url',
    category: 'technical',
    titleKey: 'studio.checklist.techValidServiceUrlTitle',
    descKey: 'studio.checklist.techValidServiceUrlDesc',
    required: true,
    automated: true,
  },
  {
    id: 'tech-sso',
    category: 'technical',
    titleKey: 'studio.checklist.techSsoTitle',
    descKey: 'studio.checklist.techSsoDesc',
    required: false,
    automated: true,
  },

  // ── Business ──────────────────────────────────────────────
  {
    id: 'biz-pricing',
    category: 'business',
    titleKey: 'studio.checklist.bizPricingTitle',
    descKey: 'studio.checklist.bizPricingDesc',
    required: true,
    automated: false,
  },
  {
    id: 'biz-refund-policy',
    category: 'business',
    titleKey: 'studio.checklist.bizRefundPolicyTitle',
    descKey: 'studio.checklist.bizRefundPolicyDesc',
    required: true,
    automated: false,
  },
];

/** All distinct categories in display order */
export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  'security',
  'performance',
  'content',
  'privacy',
  'technical',
  'business',
];
