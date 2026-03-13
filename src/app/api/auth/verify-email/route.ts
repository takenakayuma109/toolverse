import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://toolverse.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Look up the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's emailVerified and delete the token
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    logger.info('Email verified successfully', { userId: user.id, email: user.email });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Email verification error', { error: message });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for verify-email — supports clicking the link directly from email.
 * Redirects the user to the app with a success or error status.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      `${BASE_URL}/auth?verification=invalid`
    );
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        `${BASE_URL}/auth?verification=invalid`
      );
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(
        `${BASE_URL}/auth?verification=expired`
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        `${BASE_URL}/auth?verification=invalid`
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    logger.info('Email verified successfully (GET)', { userId: user.id, email: user.email });

    return NextResponse.redirect(
      `${BASE_URL}/auth?verification=success`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Email verification error (GET)', { error: message });

    return NextResponse.redirect(
      `${BASE_URL}/auth?verification=error`
    );
  }
}
