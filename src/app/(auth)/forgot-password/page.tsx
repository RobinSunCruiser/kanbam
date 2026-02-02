import Link from 'next/link';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
          <ForgotPasswordForm />

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
