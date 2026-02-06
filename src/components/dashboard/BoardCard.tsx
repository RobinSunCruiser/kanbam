'use client';

import { Link } from '@/i18n/navigation';
import { BoardMetadata } from '@/types/board';
import { useTranslations } from 'next-intl';

interface BoardCardProps {
  board: BoardMetadata;
}

export default function BoardCard({ board }: BoardCardProps) {
  const t = useTranslations('dashboard');

  return (
    <Link href={`/board/${board.uid}`}>
      <div className="group glass-light rounded-2xl p-5 cursor-pointer border border-white/10 dark:border-slate-700/30 hover:border-orange-300/50 dark:hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(249,115,22,0.075)]">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {board.title}
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            board.privilege === 'write'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400'
          }`}>
            {board.privilege === 'write' ? t('privilegeEdit') : t('privilegeView')}
          </span>
        </div>

        {board.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
            {board.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t('cards', { count: board.cardCount })}
          </span>
          <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
