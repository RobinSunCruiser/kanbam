/**
 * Email sending - transporter config + send functions
 */
import nodemailer from 'nodemailer';
import { createEmailToken } from './tokens';
import { User } from '@/types/user';
import { updateUserField } from '../storage/db';

const FROM_EMAIL = 'noreply@robinnicolay.de';
const FROM_NAME = 'CanBam';

/** Lazily initialized transporter */
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP configuration missing');
    }
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

function getAppUrl(): string {
  return process.env.APP_URL || 'http://localhost:3000';
}

/** Wrap content in email template */
function emailHtml(title: string, body: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">${title}</h2>
      ${body}
    </div>
  `;
}

function button(href: string, text: string): string {
  return `
    <p style="margin: 24px 0;">
      <a href="${href}" style="background-color: #2563eb; color: white; padding: 12px 24px;
         text-decoration: none; border-radius: 6px; display: inline-block;">${text}</a>
    </p>
  `;
}

function muted(text: string): string {
  return `<p style="color: #6b7280; font-size: 14px;">${text}</p>`;
}

async function sendEmail(to: string, subject: string, text: string, html: string) {
  await getTransporter().sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}

/** Check if verification email can be sent (rate limit: 10 min) */
function canSendVerification(user: User): boolean {
  if (!user.lastVerificationSent) return true;
  const diffMs = Date.now() - new Date(user.lastVerificationSent).getTime();
  return diffMs >= 10 * 60 * 1000;
}

/** Send verification email with rate limiting. Returns true if sent. */
export async function trySendVerificationEmail(user: User): Promise<boolean> {
  if (!canSendVerification(user)) return false;

  const url = `${getAppUrl()}/verify?token=${await createEmailToken(user.id, 'verify')}`;
  await sendEmail(
    user.email,
    'Verify your CanBam account',
    `Hi ${user.name},\n\nVerify your email: ${url}\n\nExpires in 24 hours.`,
    emailHtml('Welcome to CanBam!', `
      <p>Hi ${user.name},</p>
      <p>Please verify your email address:</p>
      ${button(url, 'Verify Email')}
      ${muted('This link expires in 24 hours.')}
      ${muted("If you didn't create an account, ignore this email.")}
    `)
  );

  await updateUserField(user.id, 'last_verification_sent', new Date().toISOString());
  return true;
}

/** Send password reset email */
export async function sendPasswordResetEmail(email: string, userId: string, userName: string) {
  const url = `${getAppUrl()}/reset-password?token=${await createEmailToken(userId, 'reset')}`;
  await sendEmail(
    email,
    'Reset your CanBam password',
    `Hi ${userName},\n\nReset your password: ${url}\n\nExpires in 1 hour.`,
    emailHtml('Reset your password', `
      <p>Hi ${userName},</p>
      <p>You requested to reset your password:</p>
      ${button(url, 'Reset Password')}
      ${muted('This link expires in 1 hour.')}
      ${muted("If you didn't request this, ignore this email.")}
    `)
  );
}

/** Send board invitation email */
export async function sendBoardInviteEmail(
  email: string,
  inviterName: string,
  boardTitle: string,
  boardUrl: string
) {
  await sendEmail(
    email,
    `You've been invited to "${boardTitle}" on CanBam`,
    `${inviterName} invited you to "${boardTitle}". View: ${boardUrl}`,
    emailHtml("You've been invited!", `
      <p><strong>${inviterName}</strong> invited you to:</p>
      <p style="font-size: 18px; color: #1f2937;">"${boardTitle}"</p>
      ${button(boardUrl, 'View Board')}
    `)
  );
}
