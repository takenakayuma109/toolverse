import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseOrError } from '@/lib/validations';
import { validatePassword } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const rl = await checkRateLimit(`reset-password:${ip}`, true);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(resetPasswordSchema, body);

    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate password strength
    const passwordCheck = validatePassword(data.password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          details: passwordCheck.errors,
        },
        { status: 400 }
      );
    }

    const email = data.email.toLowerCase();

    // Hash the incoming token to compare with the stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(data.token)
      .digest('hex');

    // Look up the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: hashedToken,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check expiry
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.deleteMany({
        where: { identifier: email, token: hashedToken },
      });

      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password (salt 12, matching existing pattern)
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, token: hashedToken },
    });

    logger.info('Password reset successful', { email });

    return NextResponse.json({
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Reset password error', { error: message });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
