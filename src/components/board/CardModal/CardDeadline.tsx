'use client';
import { PlusIcon, XIcon, CalendarIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';

interface CardDeadlineProps {
  deadline: string;
  isReadOnly: boolean;
  onChange: (deadline: string) => void;
}

export default function CardDeadline({ deadline, isReadOnly, onChange }: CardDeadlineProps) {
  const t = useTranslations('deadline');
  const dateValue = deadline ? new Date(deadline).toISOString().slice(0, 10) : '';

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
        {!isReadOnly && !deadline && (
          <label className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all cursor-pointer">
            <PlusIcon className="w-4 h-4" />
            <input
              type="date"
              value={dateValue}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
              aria-label={t('setDeadline')}
            />
          </label>
        )}
      </div>
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
