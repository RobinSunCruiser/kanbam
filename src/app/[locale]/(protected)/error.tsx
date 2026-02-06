'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

/**
 * Error boundary for protected routes
 * Catches and displays errors in the protected route group
 */
export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  useEffect(() => {
    // Log the error to error reporting service
    console.error('Protected route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('protectedError.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message || t('protectedError.description')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => reset()}
              variant="primary"
            >
              {tCommon('tryAgain')}
            </Button>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              variant="secondary"
            >
              {tCommon('goToDashboard')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
