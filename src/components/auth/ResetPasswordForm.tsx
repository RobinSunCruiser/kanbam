'use client';

import { useTransition, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { resetPasswordAction } from '@/lib/actions/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('authForm');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError('');
    formData.append('locale', locale);

    startTransition(async () => {
      const result = await resetPasswordAction(token, formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push('/login?reset=success');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        type="password"
        label={t('newPasswordLabel')}
        name="password"
        placeholder={t('passwordPlaceholder')}
        required
        autoComplete="new-password"
        minLength={8}
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('resetting') : t('resetPassword')}
      </Button>
    </form>
  );
}
