'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTransition, useState, useRef, useEffect } from 'react';
import { logoutAction, deleteAccountAction } from '@/lib/actions/auth';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';

interface NavbarProps {
  user?: { name: string; email: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const handleDeleteAccount = () => {
    setIsOpen(false);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = () => {
    startTransition(async () => {
      await deleteAccountAction();
    });
  };

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <Image
                src="/favicon.png"
                alt="KanBam Logo"
                width={36}
                height={36}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                KanBam
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    <span className="hidden sm:block">{user.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Delete Account
                      </button>
                      <hr className="my-1 border-slate-200 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        {isPending ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Account"
        message="Are you sure you want to delete your account? This will remove you from all boards and permanently delete your data. This action cannot be undone."
        confirmText={isPending ? 'Deleting...' : 'Delete Account'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
