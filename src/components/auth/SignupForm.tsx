'use client';

import { useTransition, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signupAction } from '@/lib/actions/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function SignupForm() {
  const t = useTranslations('authForm');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setError('');
    formData.append('locale', locale);

    startTransition(async () => {
      const result = await signupAction(formData);

      // If there's an error, display it (redirect happens on success)
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        type="text"
        label={t('nameLabel')}
        name="name"
        placeholder={t('namePlaceholder')}
        required
        autoComplete="name"
      />

      <Input
        type="email"
        label={t('emailLabel')}
        name="email"
        placeholder={t('emailPlaceholder')}
        required
        autoComplete="email"
      />

      <Input
        type="password"
        label={t('passwordLabel')}
        name="password"
        placeholder={t('passwordPlaceholder')}
        required
        autoComplete="new-password"
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('creatingAccount') : t('signUp')}
      </Button>
    </form>
  );
}
