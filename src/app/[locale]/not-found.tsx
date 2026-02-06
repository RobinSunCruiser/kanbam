'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

/**
 * Custom 404 page
 * Displayed when a route is not found
 */
export default function NotFound() {
  const t = useTranslations('notFound');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t('description')}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="primary">{tCommon('goToDashboard')}</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">{tCommon('goHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
