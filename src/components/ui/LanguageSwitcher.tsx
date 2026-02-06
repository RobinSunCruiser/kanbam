'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { GlobeIcon, ChevronDownIcon, CheckCircleIcon } from './Icons';

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
};

const LANGUAGE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <GlobeIcon />
        <span className="text-sm font-medium hidden sm:block">{locale.toUpperCase()}</span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-heavy shadow-glass-lg border border-white/20 dark:border-slate-700/40 rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                locale === loc
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="text-lg" role="img" aria-label={LANGUAGE_NAMES[loc]}>
                {LANGUAGE_FLAGS[loc]}
              </span>
              <span>{LANGUAGE_NAMES[loc]}</span>
              {locale === loc && (
                <CheckCircleIcon className="w-4 h-4 ml-auto text-orange-600 dark:text-orange-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
