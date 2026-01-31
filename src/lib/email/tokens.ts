/**
 * Email verification and password reset tokens (JWT-based, no DB storage)
 */
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../env';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

type TokenPurpose = 'verify' | 'reset';

/** Create a signed email token (24h for verify, 1h for reset) */
export async function createEmailToken(
  userId: string,
  purpose: TokenPurpose
): Promise<string> {
  const expiry = purpose === 'verify' ? '24h' : '1h';

  const token = await new SignJWT({ userId, purpose })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiry)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/** Verify an email token and return payload, or null if invalid */
export async function verifyEmailToken(
  token: string,
  expectedPurpose: TokenPurpose
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Validate payload structure
    if (
      !payload.userId ||
      typeof payload.userId !== 'string' ||
      payload.purpose !== expectedPurpose
    ) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}
