import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LoginForm from '@/components/auth/LoginForm';
import Footer from '@/components/ui/Footer';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reset?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { reset } = await searchParams;
  const t = await getTranslations('auth');

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t('loginTitle')}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              {t('loginOr')}{' '}
              <Link
                href="/signup"
                className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                {t('loginCreateAccount')}
              </Link>
            </p>
          </div>

          {reset === 'success' && (
            <div className="p-3 glass-light border border-green-200/50 dark:border-green-800/50 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                {t('loginPasswordResetSuccess')}
              </p>
            </div>
          )}

          <div className="glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
            <LoginForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
