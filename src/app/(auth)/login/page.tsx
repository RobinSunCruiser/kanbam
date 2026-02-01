import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

interface LoginPageProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reset } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Log in to KanBam
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              create a new account
            </Link>
          </p>
        </div>

        {reset === 'success' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 text-center">
              Password reset successfully. You can now log in with your new password.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
