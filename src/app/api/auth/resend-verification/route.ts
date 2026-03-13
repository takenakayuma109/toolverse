import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { isValidEmail } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://toolverse.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Rate limit: use the auth rate limiter (10 req/60s)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const rateLimitKey = `resend-verification:${ip}:${normalizedEmail}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, true);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(rateLimitResult.retryAfterMs / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a verification email has been sent.',
      });
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'If an account with that email exists, a verification email has been sent.',
      });
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    });

    // Send verification email
    const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(normalizedEmail, user.name, verifyUrl);

    logger.info('Verification email resent', { userId: user.id, email: normalizedEmail });

    return NextResponse.json({
      message: 'If an account with that email exists, a verification email has been sent.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Resend verification error', { error: message });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
