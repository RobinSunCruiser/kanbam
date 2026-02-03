import Link from 'next/link';
import Footer from '@/components/ui/Footer';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Check your email
            </h2>
            <p className="mt-4 text-center text-slate-600 dark:text-slate-400">
              We&apos;ve sent you a verification link. Please check your inbox and click the link to
              verify your account.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow rounded-xl text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Didn&apos;t receive the email? Check your spam folder or try logging in to resend the
              verification email.
            </p>
            <Link
              href="/login"
              className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
