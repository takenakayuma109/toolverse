import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseOrError } from '@/lib/validations';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://toolverse.app';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const rl = await checkRateLimit(`forgot-password:${ip}`, true);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(forgotPasswordSchema, body);

    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    const email = data.email.toLowerCase();

    // Always return 200 to avoid leaking whether the email exists
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      // User not found or uses OAuth only — don't reveal this
      logger.info('Password reset requested for unknown/OAuth email', { email });
      return successResponse;
    }

    // Generate a secure token
    const rawToken = crypto.randomUUID();
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Store the hashed token with 1-hour expiry
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Build the reset URL with the raw (unhashed) token
    const resetUrl = `${BASE_URL}/auth?mode=reset-password&token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetUrl);

    logger.info('Password reset email sent', { email });

    return successResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Forgot password error', { error: message });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
