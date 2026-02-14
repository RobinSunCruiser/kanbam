'use client';

import { BoardMember } from '@/types/board';
import { CheckIcon, UserIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';

interface MemberFilterProps {
  members: BoardMember[];
  activeMemberEmails: string[];
  currentUserEmail: string;
  onToggleMember: (email: string) => void;
}

export default function MemberFilter({
  members,
  activeMemberEmails,
  currentUserEmail,
  onToggleMember,
}: MemberFilterProps) {
  const t = useTranslations('members');

  return (
    <>
      {members.map((member) => {
        const isActive = activeMemberEmails.includes(member.email);
        const isYou = member.email.toLowerCase() === currentUserEmail.toLowerCase();
        const displayName = member.email.split('@')[0];
        return (
          <button
            key={member.email}
            onClick={() => onToggleMember(member.email)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border ${
              isActive
                ? 'text-orange-500 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-900/30 shadow-sm border-orange-300/30 dark:border-orange-500/20'
                : 'text-slate-600 dark:text-slate-400 glass-light border-white/10 dark:border-slate-700/30 hover:border-orange-300/50 dark:hover:border-orange-500/30'
            }`}
            aria-pressed={isActive}
          >
            <UserIcon className="w-2 h-2 shrink-0" />
            {displayName}
            {isYou && <span className="text-[10px] font-normal opacity-70">{t('you')}</span>}
            {isActive && <CheckIcon className="w-3 h-3" />}
          </button>
        );
      })}
    </>
  );
}
