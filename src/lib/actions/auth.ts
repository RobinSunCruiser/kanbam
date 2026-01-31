'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/schemas';
import { verifyPassword, hashPassword } from '../auth/password';
import { setTokenCookie, clearTokenCookie } from '../auth/session';
import { getUserByEmail, getUserById, createUser, updateUser } from '../storage/users';
import { trySendVerificationEmail, sendPasswordResetEmail } from '../email/send';
import { verifyEmailToken } from '../email/tokens';

/**
 * Server Action: Login
 * Authenticates a user and creates a session
 */
export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input using zod schema
  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  const { email, password } = validation.data;

  try {
    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Check email verification
    if (!user.emailVerified) {
      await trySendVerificationEmail(user);
      return {
        success: false,
        error: 'Please verify your email. A new verification link has been sent.',
      };
    }

    // Create session
    await setTokenCookie(user.id);

    // Revalidate and redirect
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }

  redirect('/dashboard');
}

/**
 * Server Action: Signup
 * Creates a new user account and sends verification email
 */
export async function signupAction(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input
  const validation = signupSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  const { name, email, password } = validation.data;

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
      };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, name, passwordHash });

    // Send verification email
    await trySendVerificationEmail(user);
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }

  // Redirect to check email page
  redirect('/check-email');
}

/**
 * Server Action: Logout
 * Clears the user's session and redirects to home
 */
export async function logoutAction() {
  try {
    await clearTokenCookie();
    revalidatePath('/');
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout',
    };
  }

  redirect('/');
}

/**
 * Server Action: Verify Email
 * Verifies user email using token from URL
 */
export async function verifyEmailAction(token: string) {
  try {
    const payload = await verifyEmailToken(token, 'verify');
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired verification link',
      };
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    await updateUser(payload.userId, { emailVerified: true });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('Verify email error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Server Action: Request Password Reset
 * Sends password reset email if user exists
 */
export async function forgotPasswordAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  const { email } = validation.data;

  try {
    const user = await getUserByEmail(email);

    // Always show success to prevent user enumeration
    if (user) {
      await sendPasswordResetEmail(user.email, user.id, user.name);
    }

    return {
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Server Action: Reset Password
 * Resets user password using token
 */
export async function resetPasswordAction(token: string, formData: FormData) {
  const rawData = {
    password: formData.get('password'),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  const { password } = validation.data;

  try {
    const payload = await verifyEmailToken(token, 'reset');
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired reset link',
      };
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const passwordHash = await hashPassword(password);
    await updateUser(payload.userId, { passwordHash });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }
}
