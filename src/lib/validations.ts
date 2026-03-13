import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

export const TOOL_CATEGORIES = [
  'ai',
  'productivity',
  'finance',
  'marketing',
  'development',
  'creator',
  'automation',
  'analytics',
  'security',
  'healthcare',
  'education',
  'ecommerce',
  'communication',
  'iot',
  'media',
  'logistics',
] as const;

export const PRICING_TYPES = ['free', 'freemium', 'paid', 'subscription'] as const;

export const TOOL_STATUSES = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'REJECTED'] as const;

export const SORT_OPTIONS = ['trending', 'rating', 'newest', 'users', 'name'] as const;

// ---------------------------------------------------------------------------
// Tool schemas
// ---------------------------------------------------------------------------

const pricingSchema = z.object({
  type: z.enum(PRICING_TYPES),
  price: z.number().min(0).optional(),
  currency: z.string().min(1).max(10).optional(),
  period: z.enum(['monthly', 'yearly']).optional(),
});

export const toolCreateSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .max(120)
      .optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be 500 characters or fewer'),
    longDescription: z.string().max(5000).optional(),
    icon: z.string().max(20).optional(),
    category: z.enum(TOOL_CATEGORIES),
    pricing: pricingSchema,
    tags: z
      .array(z.string().min(1).max(50))
      .min(1, 'At least one tag is required')
      .max(10, 'Maximum 10 tags'),
    serviceUrl: z.string().url('Service URL must be a valid URL').optional(),
    screenshots: z.array(z.string().url()).max(10).optional(),
  })
  .refine(
    (data) => {
      if (data.pricing.type === 'paid' || data.pricing.type === 'subscription') {
        return data.pricing.price !== undefined && data.pricing.price > 0;
      }
      return true;
    },
    { message: 'Price is required for paid/subscription tools', path: ['pricing', 'price'] }
  );

export const toolUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  longDescription: z.string().max(5000).optional(),
  icon: z.string().max(20).optional(),
  category: z.enum(TOOL_CATEGORIES).optional(),
  pricing: pricingSchema.optional(),
  tags: z.array(z.string().min(1).max(50)).min(1).max(10).optional(),
  serviceUrl: z.string().url().optional(),
  screenshots: z.array(z.string().url()).max(10).optional(),
});

// ---------------------------------------------------------------------------
// Review schemas
// ---------------------------------------------------------------------------

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(2000, 'Comment must be 2000 characters or fewer'),
});

// ---------------------------------------------------------------------------
// User schemas
// ---------------------------------------------------------------------------

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  avatar: z.string().url().optional(),
  locale: z
    .enum(['ja', 'en', 'zh', 'ko', 'fr', 'de', 'es', 'pt', 'ar', 'ru', 'hi'])
    .optional(),
});

// ---------------------------------------------------------------------------
// Creator schemas
// ---------------------------------------------------------------------------

export const creatorProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or fewer'),
  bio: z.string().max(1000, 'Bio must be 1000 characters or fewer').optional(),
  website: z.string().url('Website must be a valid URL').optional(),
});

// ---------------------------------------------------------------------------
// Search / filter schema
// ---------------------------------------------------------------------------

export const toolSearchSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.enum(TOOL_CATEGORIES).optional(),
  pricing: z.enum(PRICING_TYPES).optional(),
  sort: z.enum(SORT_OPTIONS).optional().default('trending'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ---------------------------------------------------------------------------
// Admin schemas
// ---------------------------------------------------------------------------

export const adminToolStatusSchema = z.object({
  toolId: z.string().min(1, 'Tool ID is required'),
  status: z.enum(['PUBLISHED', 'REJECTED', 'DRAFT']),
  reason: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse Zod schema and return a tuple: [data, errorResponse].
 * If validation fails, errorResponse is a plain object suitable for NextResponse.json().
 */
export function parseOrError<T>(
  schema: z.ZodType<T>,
  data: unknown
): [T, null] | [null, { error: string; details: z.ZodError['issues'] }] {
  const result = schema.safeParse(data);
  if (result.success) {
    return [result.data, null];
  }
  return [
    null,
    {
      error: 'Validation failed',
      details: result.error.issues,
    },
  ];
}

/**
 * Calculate pagination offset from page & limit.
 */
export function paginationOffset(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { offset, limit, page };
}
