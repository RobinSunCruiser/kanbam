'use client';

import Image from 'next/image';
import { useTransition, useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { logoutAction, deleteAccountAction } from '@/lib/actions/auth';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  user?: { name: string; email: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
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
      <nav className="glass-heavy shadow-glass border-b border-white/10 dark:border-slate-700/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-navbar">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <Image
                src="/favicon.png"
                alt={t('logoAlt')}
                width={36}
                height={36}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                KanBam
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
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
                    <div className="absolute right-0 mt-2 w-48 glass-heavy shadow-glass-lg border border-white/20 dark:border-slate-700/40 rounded-xl py-2 z-50">
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        {t('deleteAccount')}
                      </button>
                      <hr className="my-1 border-slate-200/50 dark:border-slate-700/50" />
                      <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                      >
                        {isPending ? t('loggingOut') : t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost" className="text-sm">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" className="text-sm">
                      {t('signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('deleteAccountConfirmTitle')}
        message={t('deleteAccountConfirmMessage')}
        confirmText={isPending ? t('deletingAccount') : t('deleteAccount')}
        cancelText={tc('cancel')}
        variant="danger"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
