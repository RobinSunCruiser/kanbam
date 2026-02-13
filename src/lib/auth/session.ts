/**
 * JWT session management - creates, verifies, and manages session tokens via cookies
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '../env';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const TOKEN_NAME = 'session';
const TOKEN_EXPIRY = '7d';

/** Decoded JWT payload containing user session data */
interface SessionPayload {
  userId: string;
  exp?: number;
}

/** Creates a signed JWT token for the given user ID */
export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/** Verifies a JWT token and returns the payload, or null if invalid */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Reject non-session tokens (e.g. calendar tokens carry a `purpose` claim)
    if (payload.purpose) {
      return null;
    }

    // Validate that userId exists
    if (!payload.userId || typeof payload.userId !== 'string') {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Creates a JWT token and sets it as an HTTP-only cookie */
export async function setTokenCookie(userId: string): Promise<void> {
  const token = await createToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/** Deletes the session token cookie (used for logout) */
export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/** Retrieves the session token from cookies, or null if not found */
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_NAME);
  return cookie?.value || null;
}
