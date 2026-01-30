'use client';

import { useTransition, useState } from 'react';
import { loginAction } from '@/lib/actions/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  /**
   * Calls imported server action (new pattern replaces fetch etc.)
   * @param formData 
   */
  const handleSubmit = async (formData: FormData) => {
    setError('');

    startTransition(async () => {
      const result = await loginAction(formData);

      // If there's an error, display it (redirect happens on success). no onSubmit in form
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        name="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        type="password"
        label="Password"
        name="password"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
