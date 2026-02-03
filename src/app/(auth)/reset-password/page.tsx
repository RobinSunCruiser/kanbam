import Link from 'next/link';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Footer from '@/components/ui/Footer';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4 relative">
          <div className="max-w-md w-full text-center glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Invalid Link
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              Request a new link
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Set new password
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              Enter your new password below.
            </p>
          </div>

          <div className="glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
