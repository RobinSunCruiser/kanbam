'use client';

import { useState, useRef, useEffect } from 'react';
import { BoardLabel } from '@/types/board';
import { PlusIcon, XIcon, CheckIcon } from '@/components/ui/Icons';
import { LABEL_COLORS } from '@/lib/constants';
import { addBoardLabelAction } from '@/lib/actions/boards';
import { useTranslations } from 'next-intl';

function hexToRgb(hex: string) {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
}

interface CardLabelsProps {
  labelIds: string[];
  boardLabels: BoardLabel[];
  boardUid: string;
  isReadOnly: boolean;
  onChange: (labelIds: string[]) => void;
  onBoardLabelsChange: (labels: BoardLabel[]) => void;
}

export default function CardLabels({ labelIds, boardLabels, boardUid, isReadOnly, onChange, onBoardLabelsChange }: CardLabelsProps) {
  const t = useTranslations('labels');
  const tCommon = useTranslations('common');
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(LABEL_COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  const selectedLabels = boardLabels.filter(l => labelIds.includes(l.id));
  const trimmed = name.trim();
  const suggestions = trimmed
    ? boardLabels.filter(l => !labelIds.includes(l.id) && l.name.toLowerCase().includes(trimmed.toLowerCase()))
    : [];
  const canAdd = trimmed.length > 0;

  const handleSelect = (labelId: string) => {
    onChange([...labelIds, labelId]);
    setName('');
    setIsAdding(false);
  };

  const handleRemove = (labelId: string) => {
    onChange(labelIds.filter(id => id !== labelId));
  };

  const handleAdd = async () => {
    if (!trimmed) return;
    const existing = boardLabels.find(l => l.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!labelIds.includes(existing.id)) onChange([...labelIds, existing.id]);
    } else {
      const result = await addBoardLabelAction(boardUid, { name: trimmed, color });
      if (result.success && result.label) {
        onBoardLabelsChange([...boardLabels, result.label]);
        onChange([...labelIds, result.label.id]);
      }
    }
    setName('');
    setColor(LABEL_COLORS[0]);
    setIsAdding(false);
  };

  const handleCancel = () => { setIsAdding(false); setName(''); setColor(LABEL_COLORS[0]); };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
        {!isReadOnly && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all" aria-label={t('addLabel')}>
            <PlusIcon />
          </button>
        )}
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.map(label => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `rgba(${hexToRgb(label.color)},0.15)`, color: label.color }}
            >
              {label.name}
              {!isReadOnly && (
                <button
                  onClick={() => handleRemove(label.id)}
                  className="rounded-full p-0.5 transition-colors opacity-60 hover:opacity-100"
                  aria-label={t('removeLabel', { name: label.name })}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl" onKeyDown={(e) => { if (e.key === 'Enter' && canAdd) handleAdd(); if (e.key === 'Escape') handleCancel(); }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('searchOrCreate')}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            maxLength={30}
          />

          <div className="flex gap-1.5">
            {LABEL_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              >
                {color === c && <CheckIcon className="w-3 h-3 text-white" />}
              </button>
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {suggestions.map(label => (
                <button
                  key={label.id}
                  onClick={() => handleSelect(label.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-white dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                  <span className="text-slate-700 dark:text-slate-300 flex-1 text-left truncate">{label.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">{tCommon('cancel')}</button>
            <button onClick={handleAdd} disabled={!canAdd} className="px-3 py-1 text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50">{tCommon('add')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
