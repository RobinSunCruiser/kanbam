'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { logoutAction } from '@/lib/actions/auth';
import Button from './Button';

interface NavbarProps {
  user?: { name: string; email: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href={user ? '/dashboard' : '/'}
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            >
              CanBam
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <Button onClick={handleLogout} variant="secondary" className="text-sm" disabled={isPending}>
                  {isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" className="text-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
