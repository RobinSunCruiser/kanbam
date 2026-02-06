'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
      {t('copyright', { year: new Date().getFullYear() })}
      <span className="mx-2">·</span>
      <Link href="/impressum" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
        {t('impressum')}
      </Link>
      <span className="mx-2">·</span>
      <Link href="/datenschutz" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
        {t('datenschutz')}
      </Link>
    </footer>
  );
}
