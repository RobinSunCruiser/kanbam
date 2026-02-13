import { headers } from 'next/headers';

/** Get the application base URL (no trailing slash) */
export async function getAppUrl(): Promise<string> {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  try {
    const host = (await headers()).get('host');
    if (host) {
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  } catch {
    // headers() throws outside request context
  }

  return 'http://localhost:3000';
}
