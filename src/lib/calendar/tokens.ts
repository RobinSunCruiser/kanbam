import { SignJWT, jwtVerify } from 'jose';
import { env } from '../env';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

/** Create a signed calendar subscription token (1 year expiry) */
export async function createCalendarToken(
  userId: string,
  boardUid: string,
  locale: string = 'en'
): Promise<string> {
  const token = await new SignJWT({ userId, boardUid, locale, purpose: 'calendar' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('365d')
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/** Verify a calendar token - returns payload or null if invalid/expired */
export async function verifyCalendarToken(
  token: string
): Promise<{ userId: string; boardUid: string; locale: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (
      !payload.userId ||
      typeof payload.userId !== 'string' ||
      !payload.boardUid ||
      typeof payload.boardUid !== 'string' ||
      payload.purpose !== 'calendar'
    ) {
      return null;
    }

    const locale = typeof payload.locale === 'string' ? payload.locale : 'en';
    return { userId: payload.userId, boardUid: payload.boardUid, locale };
  } catch {
    return null;
  }
}
