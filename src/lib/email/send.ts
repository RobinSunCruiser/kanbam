/**
 * Email sending with Resend
 */
import { Resend } from 'resend';
import { createEmailToken } from './tokens';
import { User } from '@/types/user';
import { updateUserField } from '../storage/db';
import { getAppUrl } from '@/lib/utils/url';
import en from '../../../messages/en.json';
import de from '../../../messages/de.json';

type EmailMessages = typeof en;
const messages: Record<string, EmailMessages> = { en, de };

/** Resolve an email translation key with variable interpolation */
function t(locale: string, key: string, vars?: Record<string, string>): string {
  const email = (messages[locale] ?? messages.en).email as Record<string, string>;
  let value = email[key] ?? (messages.en.email as Record<string, string>)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replaceAll(`{${k}}`, v);
    }
  }
  return value;
}

/** Lazily initialized Resend client */
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
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
  const fromName = process.env.EMAIL_FROM_NAME;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;

  if (!fromName || !fromEmail) {
    throw new Error('EMAIL_FROM_NAME and EMAIL_FROM_ADDRESS must be configured');
  }

  const { error } = await getResend().emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/** Check if verification email can be sent (rate limit: 10 min) */
export function canSendVerification(user: User): boolean {
  if (!user.lastVerificationSent) return true;
  const diffMs = Date.now() - new Date(user.lastVerificationSent).getTime();
  return diffMs >= 10 * 60 * 1000;
}

/** Send verification email with rate limiting. Returns true if sent. */
export async function trySendVerificationEmail(user: User, locale: string = 'en'): Promise<boolean> {
  if (!canSendVerification(user)) return false;

  const url = `${await getAppUrl()}/${locale}/verify?token=${await createEmailToken(user.id, 'verify')}`;
  await sendEmail(
    user.email,
    t(locale, 'verifySubject'),
    t(locale, 'verifyText', { name: user.name, url }),
    emailHtml(t(locale, 'verifyTitle'), `
      <p>${t(locale, 'verifyGreeting', { name: user.name })}</p>
      <p>${t(locale, 'verifyBody')}</p>
      ${button(url, t(locale, 'verifyButton'))}
      ${muted(t(locale, 'verifyExpiry'))}
      ${muted(t(locale, 'verifyIgnore'))}
    `)
  );

  await updateUserField(user.id, 'last_verification_sent', new Date().toISOString());
  return true;
}

/** Send password reset email */
export async function sendPasswordResetEmail(email: string, userId: string, userName: string, locale: string = 'en') {
  const url = `${await getAppUrl()}/${locale}/reset-password?token=${await createEmailToken(userId, 'reset')}`;
  await sendEmail(
    email,
    t(locale, 'resetSubject'),
    t(locale, 'resetText', { name: userName, url }),
    emailHtml(t(locale, 'resetTitle'), `
      <p>${t(locale, 'resetGreeting', { name: userName })}</p>
      <p>${t(locale, 'resetBody')}</p>
      ${button(url, t(locale, 'resetButton'))}
      ${muted(t(locale, 'resetExpiry'))}
      ${muted(t(locale, 'resetIgnore'))}
    `)
  );
}

/** Send card assignment notification email */
export async function sendCardAssignmentEmail(
  assigneeEmail: string,
  assignerName: string,
  cardTitle: string,
  boardTitle: string,
  boardUid: string,
  locale: string = 'en'
) {
  const boardUrl = `${await getAppUrl()}/${locale}/board/${boardUid}`;
  await sendEmail(
    assigneeEmail,
    t(locale, 'assignSubject', { cardTitle }),
    t(locale, 'assignText', { assignerName, cardTitle, boardTitle, boardUrl }),
    emailHtml(t(locale, 'assignTitle'), `
      <p><strong>${t(locale, 'assignBody', { assignerName })}</strong></p>
      <p style="font-size: 18px; color: #1f2937;">"${cardTitle}"</p>
      <p style="color: #6b7280;">${t(locale, 'assignBoardContext', { boardTitle })}</p>
      ${button(boardUrl, t(locale, 'assignButton'))}
    `)
  );
}

/** Send comment notification email to the card assignee */
export async function sendCommentNotificationEmail(
  assigneeEmail: string,
  commenterName: string,
  commentText: string,
  cardTitle: string,
  boardTitle: string,
  boardUid: string,
  locale: string = 'en'
) {
  const boardUrl = `${await getAppUrl()}/${locale}/board/${boardUid}`;
  await sendEmail(
    assigneeEmail,
    t(locale, 'commentSubject', { cardTitle }),
    t(locale, 'commentText', { commenterName, cardTitle, boardTitle, commentText, boardUrl }),
    emailHtml(t(locale, 'commentTitle'), `
      <p><strong>${t(locale, 'commentBody', { commenterName })}</strong></p>
      <p style="font-size: 18px; color: #1f2937;">"${cardTitle}"</p>
      <p style="color: #6b7280;">${t(locale, 'commentBoardContext', { boardTitle })}</p>
      <blockquote style="border-left: 3px solid #e5e7eb; padding-left: 12px; color: #4b5563; margin: 16px 0;">${commentText}</blockquote>
      ${button(boardUrl, t(locale, 'commentButton'))}
    `)
  );
}
