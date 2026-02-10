'use client';
import { useState, useRef, useEffect } from 'react';
import { PlusIcon, XIcon, CalendarIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';

interface CardDeadlineProps {
  deadline: string;
  isReadOnly: boolean;
  onChange: (deadline: string) => void;
}

export default function CardDeadline({ deadline, isReadOnly, onChange }: CardDeadlineProps) {
  const t = useTranslations('deadline');
  const tCommon = useTranslations('common');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(new Date(e.target.value).toISOString());
    }
    setIsAdding(false);
  };

  const handleCancel = () => setIsAdding(false);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
        {!isReadOnly && !deadline && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all" aria-label={t('setDeadline')}>
            <PlusIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAdding && !deadline && (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <input
            ref={inputRef}
            type="date"
            onChange={handleDateChange}
            onKeyDown={(e) => { if (e.key === 'Escape') handleCancel(); }}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            aria-label={t('setDeadline')}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">{tCommon('cancel')}</button>
          </div>
        </div>
      )}

      {deadline && (
        <div className="flex flex-wrap gap-2">
          <div className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {new Date(deadline).toLocaleDateString()}
            </span>
            {!isReadOnly && (
              <button
                onClick={() => onChange('')}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 -m-1 text-slate-400 hover:text-red-500 transition-all ml-1"
                aria-label={t('removeDeadline')}
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
