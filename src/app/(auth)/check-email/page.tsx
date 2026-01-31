import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Check your email
          </h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            We&apos;ve sent you a verification link. Please check your inbox and click the link to
            verify your account.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Didn&apos;t receive the email? Check your spam folder or try logging in to resend the
            verification email.
          </p>
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
