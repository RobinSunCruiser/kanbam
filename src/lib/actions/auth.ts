'use server';

import { revalidatePath } from 'next/cache';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/schemas';
import { verifyPassword, hashPassword } from '../auth/password';
import { setTokenCookie, clearTokenCookie } from '../auth/session';
import { getUserByEmail, getUserById, createUser, updateUser, deleteUser } from '../storage/users';
import { listBoardsByEmail, removeBoardMember, clearAssigneeFromBoard, transferBoardOwnership } from '../storage/boards';
import { requireAuth } from '../auth/middleware';
import { trySendVerificationEmail, sendPasswordResetEmail } from '../email/send';
import { verifyEmailToken } from '../email/tokens';

/**
 * Server Action: Login
 * Authenticates a user and creates a session
 */
export async function loginAction(formData: FormData) {
  const locale = (formData.get('locale') as string) || (await getLocale());
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input using zod schema
  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('genericError'),
    };
  }

  const { email, password } = validation.data;

  try {
    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        error: t('invalidCredentials'),
      };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        error: t('invalidCredentials'),
      };
    }

    // Check email verification
    if (!user.emailVerified) {
      await trySendVerificationEmail(user, locale);
      return {
        success: false,
        error: t('verifyEmail'),
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
      error: t('genericError'),
    };
  }

  redirect({ href: '/dashboard', locale });
}

/**
 * Server Action: Signup
 * Creates a new user account and sends verification email
 */
export async function signupAction(formData: FormData) {
  const locale = (formData.get('locale') as string) || (await getLocale());
  const t = await getTranslations({ locale, namespace: 'errors' });

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
      error: validation.error.issues[0]?.message || t('genericError'),
    };
  }

  const { name, email, password } = validation.data;

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      // If user exists but is NOT verified, resend verification and
      // fall through to redirect (recovers from stuck state where signup email failed)
      if (!existingUser.emailVerified) {
        try {
          await trySendVerificationEmail(existingUser, locale);
        } catch (emailError) {
          console.error('Failed to resend verification email during signup:', emailError);
        }
      } else {
        return {
          success: false,
          error: t('emailAlreadyRegistered'),
        };
      }
    } else {
      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await createUser({ email, name, passwordHash });

      // Send verification email (non-blocking — user can resend from check-email page)
      try {
        await trySendVerificationEmail(user, locale);
      } catch (emailError) {
        console.error('Failed to send verification email after signup:', emailError);
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: t('genericError'),
    };
  }

  // Redirect to check email page (outside try-catch so redirect() is not caught)
  redirect({ href: '/check-email', locale });
}

/**
 * Server Action: Logout
 * Clears the user's session and redirects to home
 */
export async function logoutAction() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    await clearTokenCookie();
    revalidatePath('/');
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: t('failedToLogout'),
    };
  }

  redirect({ href: '/', locale });
}

/**
 * Server Action: Verify Email
 * Verifies user email using token from URL
 */
export async function verifyEmailAction(token: string) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const payload = await verifyEmailToken(token, 'verify');
    if (!payload) {
      return {
        success: false,
        error: t('invalidVerificationLink'),
      };
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return {
        success: false,
        error: t('userNotFound'),
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: t('emailAlreadyVerified'),
      };
    }

    await updateUser(payload.userId, { emailVerified: true });

    return {
      success: true,
      message: t('emailVerifiedSuccess'),
    };
  } catch (error) {
    console.error('Verify email error:', error);
    return {
      success: false,
      error: t('genericError'),
    };
  }
}

/**
 * Server Action: Request Password Reset
 * Sends password reset email if user exists
 */
export async function forgotPasswordAction(formData: FormData) {
  const locale = (formData.get('locale') as string) || (await getLocale());
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    email: formData.get('email'),
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('genericError'),
    };
  }

  const { email } = validation.data;

  try {
    const user = await getUserByEmail(email);

    // Always show success to prevent user enumeration
    if (user) {
      await sendPasswordResetEmail(user.email, user.id, user.name, locale);
    }

    return {
      success: true,
      message: t('resetLinkSent'),
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      error: t('genericError'),
    };
  }
}

/**
 * Server Action: Reset Password
 * Resets user password using token
 */
export async function resetPasswordAction(token: string, formData: FormData) {
  const locale = (formData.get('locale') as string) || (await getLocale());
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    password: formData.get('password'),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('genericError'),
    };
  }

  const { password } = validation.data;

  try {
    const payload = await verifyEmailToken(token, 'reset');
    if (!payload) {
      return {
        success: false,
        error: t('invalidResetLink'),
      };
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return {
        success: false,
        error: t('userNotFound'),
      };
    }

    const passwordHash = await hashPassword(password);
    await updateUser(payload.userId, { passwordHash });

    return {
      success: true,
      message: t('passwordResetSuccess'),
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: t('genericError'),
    };
  }
}

/**
 * Server Action: Delete Account
 * Removes user from all boards and deletes account
 */
export async function deleteAccountAction() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();

    // Remove user from all boards
    const boards = await listBoardsByEmail(user.email);
    for (const board of boards) {
      // Clear card assignee references before removing membership
      await clearAssigneeFromBoard(board.uid, user.email);

      // Transfer ownership if this user is the board owner and other members exist
      if (board.ownerId === user.id) {
        const remainingMembers = board.members.filter(
          m => m.email.toLowerCase() !== user.email.toLowerCase()
        );
        if (remainingMembers.length > 0) {
          const writeMembers = remainingMembers.filter(m => m.privilege === 'write');
          const newOwnerEmail = writeMembers.length > 0
            ? writeMembers[0].email
            : remainingMembers[0].email;
          await transferBoardOwnership(board.uid, newOwnerEmail);
        }
      }

      await removeBoardMember(board.uid, user.email);
    }

    // Delete user account
    await deleteUser(user.id);

    // Clear session
    await clearTokenCookie();
    revalidatePath('/');
  } catch (error) {
    console.error('Delete account error:', error);
    return {
      success: false,
      error: t('failedToDeleteAccount'),
    };
  }

  redirect({ href: '/', locale });
}

/**
 * Server Action: Resend Verification Email
 * Sends a new verification email if the user exists and is unverified.
 * Always returns success to prevent user enumeration.
 */
export async function resendVerificationAction(formData: FormData) {
  const locale = (formData.get('locale') as string) || (await getLocale());
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    email: formData.get('email'),
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('genericError'),
    };
  }

  const { email } = validation.data;

  try {
    const user = await getUserByEmail(email);

    // Only send if user exists and is not yet verified
    if (user && !user.emailVerified) {
      await trySendVerificationEmail(user, locale);
    }

    // Always return success to prevent user enumeration
    return {
      success: true,
      message: t('verificationResent'),
    };
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      error: t('genericError'),
    };
  }
}
