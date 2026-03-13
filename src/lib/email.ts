import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  welcomeEmailHtml,
  passwordResetEmailHtml,
  verificationEmailHtml,
  payoutNotificationEmailHtml,
} from '@/lib/email-templates';

// ─── Configuration ────────────────────────────────────────────────────────────

const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@toolverse.app';
const isDev = process.env.NODE_ENV !== 'production';

function hasSmtpConfig(): boolean {
  return !!(
    process.env.EMAIL_SERVER_HOST &&
    process.env.EMAIL_SERVER_PORT &&
    process.env.EMAIL_SERVER_USER &&
    process.env.EMAIL_SERVER_PASSWORD
  );
}

// ─── Transporter (lazy singleton) ─────────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (_transporter) return _transporter;

  if (!hasSmtpConfig()) {
    console.warn(
      '[email] SMTP env vars are not fully configured. Emails will be logged to console.',
    );
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  return _transporter;
}

// ─── Generic sender ──────────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const message = { from: EMAIL_FROM, to, subject, html };

  if (isDev || !getTransporter()) {
    console.log('[email] (dev/fallback) Would send email:');
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  HTML:    ${html.slice(0, 200)}...`);
    return;
  }

  try {
    await getTransporter()!.sendMail(message);
  } catch (error) {
    console.error('[email] Failed to send email:', error);
    throw error;
  }
}

// ─── Purpose-specific senders ─────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  await sendEmail(to, `Welcome to Toolverse, ${name}!`, welcomeEmailHtml(name));
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  await sendEmail(
    to,
    'Reset your Toolverse password',
    passwordResetEmailHtml(resetUrl),
  );
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string,
): Promise<void> {
  await sendEmail(
    to,
    'Verify your Toolverse email address',
    verificationEmailHtml(name, verifyUrl),
  );
}

export async function sendPayoutNotification(
  to: string,
  amount: string,
  currency: string,
): Promise<void> {
  await sendEmail(
    to,
    `Payout of ${currency.toUpperCase()} ${amount} sent`,
    payoutNotificationEmailHtml(amount, currency),
  );
}
