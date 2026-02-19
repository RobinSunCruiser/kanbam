import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Footer from '@/components/ui/Footer';
import ResendVerificationForm from '@/components/auth/ResendVerificationForm';

interface CheckEmailPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckEmailPage({ params }: CheckEmailPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('auth');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t('checkEmailTitle')}
            </h2>
            <p className="mt-4 text-center text-slate-600 dark:text-slate-400">
              {t('checkEmailDescription')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
              {t('resendVerificationDescription')}
            </p>
            <ResendVerificationForm />
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                {t('goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
