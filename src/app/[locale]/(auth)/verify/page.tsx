import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { verifyEmailAction } from '@/lib/actions/auth';
import Footer from '@/components/ui/Footer';

interface VerifyPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ params, searchParams }: VerifyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { token } = await searchParams;
  const t = await getTranslations('auth');

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {t('invalidLinkTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('invalidVerificationLink')}
            </p>
            <Link
              href="/login"
              className="text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              {t('goToLogin')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          {result.success ? (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {t('emailVerifiedTitle')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('emailVerifiedDescription')}
              </p>
              <Link
                href="/login"
                className="inline-block bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors"
              >
                {t('goToLogin')}
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {t('verificationFailedTitle')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{result.error}</p>
              <Link
                href="/login"
                className="text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                {t('goToLogin')}
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
