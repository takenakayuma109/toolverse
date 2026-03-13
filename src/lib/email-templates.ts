// ─── Email HTML Templates ─────────────────────────────────────────────────────
// Inline CSS only (email-safe). Toolverse brand violet: #7c3aed

const BRAND_COLOR = '#7c3aed';
const APP_NAME = 'Toolverse';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://toolverse.app';

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e4e4e7;color:#a1a1aa;font-size:12px;line-height:1.5;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br/>
            <a href="${BASE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${BASE_URL}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td style="background-color:${BRAND_COLOR};border-radius:6px;padding:12px 24px;">
    <a href="${href}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${label}</a>
  </td></tr>
</table>`;
}

// ─── Public template functions ────────────────────────────────────────────────

export function welcomeEmailHtml(name: string): string {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">Welcome to ${APP_NAME}, ${name}!</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Thanks for signing up. You now have access to thousands of tools built by
      creators around the world.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Explore the marketplace, save your favourites, and start building your own
      tools in the Tool Studio.
    </p>
    ${button(`${BASE_URL}`, 'Explore Toolverse')}
    <p style="margin:0;font-size:13px;color:#71717a;">If you have any questions, reply to this email&mdash;we&rsquo;re happy to help.</p>
  `);
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">Reset your password</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;line-height:1.6;">
      We received a request to reset the password for your ${APP_NAME} account.
      Click the button below to choose a new password.
    </p>
    ${button(resetUrl, 'Reset Password')}
    <p style="margin:0 0 4px;font-size:13px;color:#71717a;">This link expires in 1 hour.</p>
    <p style="margin:0;font-size:13px;color:#71717a;">If you didn&rsquo;t request this, you can safely ignore this email.</p>
  `);
}

export function verificationEmailHtml(name: string, verifyUrl: string): string {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">Verify your email address</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Hi ${name}, thanks for signing up for ${APP_NAME}!
      Please verify your email address by clicking the button below.
    </p>
    ${button(verifyUrl, 'Verify Email')}
    <p style="margin:0 0 4px;font-size:13px;color:#71717a;">This link expires in 24 hours.</p>
    <p style="margin:0;font-size:13px;color:#71717a;">If you didn&rsquo;t create an account, you can safely ignore this email.</p>
  `);
}

export function payoutNotificationEmailHtml(
  amount: string,
  currency: string,
): string {
  const formatted = `${currency.toUpperCase()} ${amount}`;
  return layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">Payout sent!</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Great news&mdash;a payout of <strong>${formatted}</strong> has been initiated
      to your connected bank account.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;line-height:1.6;">
      It typically takes 2&ndash;5 business days to arrive, depending on your bank.
    </p>
    ${button(`${BASE_URL}`, 'View Dashboard')}
    <p style="margin:0;font-size:13px;color:#71717a;">Questions about payouts? Reply to this email.</p>
  `);
}
