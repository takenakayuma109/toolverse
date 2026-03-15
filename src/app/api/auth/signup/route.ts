import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { isValidEmail, validatePassword } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://toolverse.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          details: passwordCheck.errors,
        },
        { status: 400 }
      );
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: email.toLowerCase(),
        hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate verification token and send email
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token,
          expires,
        },
      });

      const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;
      await sendVerificationEmail(email.toLowerCase(), trimmedName, verifyUrl);
    } catch (emailError) {
      // Log but don't fail signup if email sending fails
      const message = emailError instanceof Error ? emailError.message : 'Unknown error';
      logger.error('Failed to send verification email', { error: message, userId: user.id });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Signup error', { error: message });

    // Handle Prisma unique constraint violation
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.', detail: message },
      { status: 500 }
    );
  }
}
