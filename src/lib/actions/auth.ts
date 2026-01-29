'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loginSchema, signupSchema } from '../validation/schemas';
import { verifyPassword, hashPassword } from '../auth/password';
import { setTokenCookie, clearTokenCookie } from '../auth/session';
import { getUserByEmail, createUser } from '../storage/users';

/**
 * Server Action: Login
 * Authenticates a user and creates a session
 */
export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input
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
 * Creates a new user account and session
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

    // Create session
    await setTokenCookie(user.id);

    // Revalidate and redirect
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }

  redirect('/dashboard');
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
