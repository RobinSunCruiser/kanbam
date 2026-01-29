'use client';

import { useTransition, useState } from 'react';
import { signupAction } from '@/lib/actions/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setError('');

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
        label="Name"
        name="name"
        placeholder="John Doe"
        required
        autoComplete="name"
      />

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
        autoComplete="new-password"
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Sign up'}
      </Button>
    </form>
  );
}
