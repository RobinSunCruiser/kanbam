'use client';

import { BoardLabel } from '@/types/board';
import { CheckIcon, XIcon } from '@/components/ui/Icons';
import { hexToRgb } from '@/lib/utils/colors';
import { useTranslations } from 'next-intl';

interface LabelFilterProps {
  labels: BoardLabel[];
  activeLabelIds: string[];
  onToggleLabel: (labelId: string) => void;
  onClearAll: () => void;
}

export default function LabelFilter({
  labels,
  activeLabelIds,
  onToggleLabel,
  onClearAll,
}: LabelFilterProps) {
  const t = useTranslations('board');

  return (
    <>
      {labels.map((label) => {
        const isActive = activeLabelIds.includes(label.id);
        return (
          <button
            key={label.id}
            onClick={() => onToggleLabel(label.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border ${
              isActive
                ? 'shadow-sm border-current/20'
                : 'glass-light border-white/10 dark:border-slate-700/30 hover:border-orange-300/50 dark:hover:border-orange-500/30'
            }`}
            style={{
              backgroundColor: isActive
                ? `rgba(${hexToRgb(label.color)},0.15)`
                : undefined,
              color: label.color,
            }}
            aria-pressed={isActive}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            {label.name}
            {isActive && <CheckIcon className="w-3 h-3" />}
          </button>
        );
      })}

      {activeLabelIds.length > 0 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 whitespace-nowrap"
        >
          <XIcon className="w-3 h-3" />
          {t('clearFilters')}
        </button>
      )}
    </>
  );
}
