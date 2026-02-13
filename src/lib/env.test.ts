import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the env schema from env.ts for isolated testing
// (env.ts eagerly evaluates on import, making it hard to test directly)
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'kanbam-secret-key-change-in-production',
      'JWT_SECRET must be changed from the default value in production'
    ),
  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM_NAME: z
    .string()
    .min(1, 'EMAIL_FROM_NAME is required'),
  EMAIL_FROM_ADDRESS: z
    .string()
    .email('EMAIL_FROM_ADDRESS must be a valid email'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const validEnv = {
  DATABASE_URL: 'https://db.example.com/mydb',
  JWT_SECRET: 'a-valid-secret-key-that-is-at-least-32-characters',
  RESEND_API_KEY: 're_123abc',
  EMAIL_FROM_NAME: 'KanBam',
  EMAIL_FROM_ADDRESS: 'noreply@example.com',
  NODE_ENV: 'production' as const,
};

describe('env schema', () => {
  it('accepts valid environment', () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('rejects missing DATABASE_URL', () => {
    expect(envSchema.safeParse({ ...validEnv, DATABASE_URL: undefined }).success).toBe(false);
  });

  it('rejects invalid DATABASE_URL', () => {
    expect(envSchema.safeParse({ ...validEnv, DATABASE_URL: 'not-a-url' }).success).toBe(false);
  });

  it('rejects JWT_SECRET shorter than 32 characters', () => {
    expect(envSchema.safeParse({ ...validEnv, JWT_SECRET: 'short' }).success).toBe(false);
  });

  it('rejects default JWT_SECRET value', () => {
    expect(
      envSchema.safeParse({ ...validEnv, JWT_SECRET: 'kanbam-secret-key-change-in-production' }).success
    ).toBe(false);
  });

  it('rejects missing RESEND_API_KEY', () => {
    expect(envSchema.safeParse({ ...validEnv, RESEND_API_KEY: undefined }).success).toBe(false);
  });

  it('rejects invalid EMAIL_FROM_ADDRESS', () => {
    expect(envSchema.safeParse({ ...validEnv, EMAIL_FROM_ADDRESS: 'bad' }).success).toBe(false);
  });

  it('defaults NODE_ENV to development when omitted', () => {
    const result = envSchema.safeParse({ ...validEnv, NODE_ENV: undefined });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('development');
    }
  });

  it('rejects invalid NODE_ENV value', () => {
    expect(envSchema.safeParse({ ...validEnv, NODE_ENV: 'staging' }).success).toBe(false);
  });
});
