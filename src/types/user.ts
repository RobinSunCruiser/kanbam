/**
 * User model representing a database user record
 * Contains full user data including password hash
 */
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  lastVerificationSent: string | null;
  createdAt: string;
}

/**
 * Authenticated user data (without sensitive fields)
 * Used for session and client-side user representation
 */
export interface UserAuth {
  id: string;
  email: string;
  name: string;
}
