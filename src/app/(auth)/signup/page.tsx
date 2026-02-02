import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              log in to existing account
            </Link>
          </p>
        </div>

        <div className="glass-heavy glass-glow p-8 rounded-2xl border border-white/10 dark:border-slate-700/30">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
