import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'canbam-secret-key-change-in-production'
);
const TOKEN_NAME = 'session';
const TOKEN_EXPIRY = '7d';

interface JWTPayload {
  userId: string;
  exp?: number;
}

export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function setTokenCookie(userId: string): Promise<void> {
  const token = await createToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_NAME);
  return cookie?.value || null;
}
