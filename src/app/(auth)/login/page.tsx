import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

interface LoginPageProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reset } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Log in to KanBam
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              create a new account
            </Link>
          </p>
        </div>

        {reset === 'success' && (
          <div className="p-3 glass-light border border-green-200/50 dark:border-green-800/50 rounded-xl">
            <p className="text-sm text-green-600 dark:text-green-400 text-center">
              Password reset successfully. You can now log in with your new password.
            </p>
          </div>
        )}

        <div className="glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
