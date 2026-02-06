'use client';

import { useState, useRef, useEffect } from 'react';
import { BoardMember } from '@/types/board';
import { PlusIcon, XIcon, UserIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';

interface CardAssigneeProps {
  assignee: string;
  boardMembers: BoardMember[];
  isReadOnly: boolean;
  onChange: (assignee: string) => void;
}

export default function CardAssignee({ assignee, boardMembers, isReadOnly, onChange }: CardAssigneeProps) {
  const t = useTranslations('assignee');
  const [showSelect, setShowSelect] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (showSelect && selectRef.current) {
      selectRef.current.focus();
    }
  }, [showSelect]);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
        {!isReadOnly && !assignee && (
          <button
            onClick={() => setShowSelect(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
            aria-label={t('assignMember')}
          >
            <PlusIcon />
          </button>
        )}
      </div>
      {assignee ? (
        <div className="flex flex-wrap gap-2">
          <div className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {assignee}
            </span>
            {!isReadOnly && (
              <button
                onClick={() => onChange('')}
                className="opacity-0 group-hover:opacity-100 p-1.5 -m-1 text-slate-400 hover:text-red-500 transition-all ml-1"
                aria-label={t('removeAssignee')}
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : showSelect && (
        <select
          ref={selectRef}
          value=""
          onChange={(e) => {
            onChange(e.target.value);
            setShowSelect(false);
          }}
          onBlur={() => setShowSelect(false)}
          className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-slate-100 transition-all"
        >
          <option value="">{t('select')}</option>
          {boardMembers.map((member) => (
            <option key={member.email} value={member.email}>
              {member.email}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
