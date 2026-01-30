'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <Image
              src="/favicon.png"
              alt="CanBam Logo"
              width={36}
              height={36}
              className="transition-transform group-hover:scale-110"
            />
            <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              CanBam
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                  {user.name}
                </span>
                <Button onClick={handleLogout} variant="ghost" className="text-sm" disabled={isPending}>
                  {isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">
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
