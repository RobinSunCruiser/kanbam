import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Footer from '@/components/ui/Footer';

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('auth');

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t('forgotPasswordTitle')}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              {t('forgotPasswordDescription')}
            </p>
          </div>

          <div className="glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
            <ForgotPasswordForm />

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                {t('backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
