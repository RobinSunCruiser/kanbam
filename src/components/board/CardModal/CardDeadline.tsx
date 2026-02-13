'use client';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { PlusIcon, XIcon, CalendarIcon, BellIcon } from '@/components/ui/Icons';
import { Calendar } from '@/components/ui/Calendar';
import { useTranslations } from 'next-intl';
import { REMINDER_OPTIONS } from '@/lib/constants';
import type { ReminderOption } from '@/types/board';

interface CardDeadlineProps {
  deadline: string;
  reminder: ReminderOption | '';
  isReadOnly: boolean;
  onChange: (deadline: string) => void;
  onReminderChange: (reminder: ReminderOption | '') => void;
}

export default function CardDeadline({ deadline, reminder, isReadOnly, onChange, onReminderChange }: CardDeadlineProps) {
  const t = useTranslations('deadline');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse as local date: YYYY-MM-DD gets 'T00:00:00' appended (local midnight per spec);
  // legacy ISO strings (contain 'T') pass through unchanged
  const selectedDate = deadline
    ? new Date(deadline.includes('T') ? deadline : deadline + 'T00:00:00')
    : undefined;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape (capture phase so it fires before the modal's handler)
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [open]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Store as YYYY-MM-DD to avoid timezone shifts (local midnight → UTC can change the date)
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      onChange(`${yyyy}-${mm}-${dd}`);
    }
    setOpen(false);
  };

  const handleClearDeadline = () => {
    onChange('');
    onReminderChange('');
  };

  const calendarDropdown = (align: 'left' | 'right' = 'left') => open && (
    <div className={align === 'right'
      ? 'absolute right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800'
      : 'absolute left-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800'
    }>
      <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} />
    </div>
  );

  const formattedDate = deadline
    ? format(new Date(deadline.includes('T') ? deadline : deadline + 'T00:00:00'), 'PPP')
    : '';

  const datePill = (
    <>
      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {formattedDate}
      </span>
    </>
  );

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
        {!isReadOnly && !deadline && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              aria-label={t('setDeadline')}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            {calendarDropdown('right')}
          </div>
        )}
      </div>

      {deadline && (
        <div className="flex flex-wrap gap-2">
          <div className="relative" ref={dropdownRef}>
            <div className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
              <button
                onClick={() => !isReadOnly && setOpen(!open)}
                className="flex items-center gap-1.5"
              >
                {datePill}
              </button>
              {!isReadOnly && (
                <button
                  onClick={handleClearDeadline}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 -m-1 text-slate-400 hover:text-red-500 transition-all ml-1"
                  aria-label={t('removeDeadline')}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {calendarDropdown()}
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
              <BellIcon className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={reminder || ''}
                onChange={(e) => onReminderChange(e.target.value as ReminderOption | '')}
                className="appearance-none text-xs bg-transparent text-slate-500 dark:text-slate-400 border-none outline-none cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <option value="" className="text-black">{t('noReminder')}</option>
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="text-black">{t(opt)}</option>
                ))}
              </select>
            </div>
          )}

          {isReadOnly && reminder && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(reminder)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
