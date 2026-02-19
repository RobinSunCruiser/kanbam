'use client';

import { useTransition, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { resendVerificationAction } from '@/lib/actions/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ResendVerificationForm() {
  const t = useTranslations('authForm');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError('');
    formData.append('locale', locale);
    setSuccess(false);

    startTransition(async () => {
      const result = await resendVerificationAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t('verificationResent')}
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label={t('emailLabel')}
        name="email"
        placeholder={t('emailPlaceholder')}
        required
        autoComplete="email"
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('resending') : t('resendVerificationLink')}
      </Button>
    </form>
  );
}
