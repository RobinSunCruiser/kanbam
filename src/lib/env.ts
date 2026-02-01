import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid at runtime
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .min(1, 'DATABASE_URL is required'),

  // Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'kanbam-secret-key-change-in-production',
      'JWT_SECRET must be changed from the default value in production'
    ),

  // Email (Resend)
  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM_NAME: z
    .string()
    .min(1, 'EMAIL_FROM_NAME is required'),
  EMAIL_FROM_ADDRESS: z
    .string()
    .email('EMAIL_FROM_ADDRESS must be a valid email'),

  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validates and parses environment variables
 * Throws an error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
      EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Environment validation failed:\n${messages.join('\n')}\n\n` +
          'Please check your .env.local file and ensure all required variables are set correctly.'
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Use this instead of process.env for type-safety
 */
export const env = validateEnv();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;
