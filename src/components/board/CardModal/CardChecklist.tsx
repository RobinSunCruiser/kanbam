'use client';

import { useState, useRef, useEffect } from 'react';
import { ChecklistItem } from '@/types/board';
import { nanoid } from 'nanoid';
import { PlusIcon, XIcon, CheckIcon, CircleIcon } from '@/components/ui/Icons';

interface CardChecklistProps {
  items: ChecklistItem[];
  isReadOnly: boolean;
  onChange: (items: ChecklistItem[]) => void;
}

export default function CardChecklist({ items, isReadOnly, onChange }: CardChecklistProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    onChange([...items, { id: nanoid(), text: newItemText.trim(), checked: false }]);
    setNewItemText('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewItemText('');
  };

  const handleToggle = (itemId: string) => {
    onChange(items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));
  };

  const checkedCount = items.filter(item => item.checked).length;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Checklist</h3>
          {items.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
              {checkedCount}/{items.length}
            </span>
          )}
        </div>
        {!isReadOnly && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
            aria-label="Add checklist item"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                item.checked
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-slate-50 dark:bg-slate-800/50'
              }`}
              onClick={() => !isReadOnly && handleToggle(item.id)}
            >
              <span className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                {item.checked ? (
                  <CheckIcon className="w-3.5 h-3.5 text-green-500 transition-colors" />
                ) : (
                  <CircleIcon className="w-3.5 h-3.5 text-slate-400 transition-colors" />
                )}
              </span>
              <span className={`text-sm transition-colors ${
                item.checked
                  ? 'line-through text-green-600 dark:text-green-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {item.text}
              </span>
              {!isReadOnly && (
                <button
                  onClick={(e) => { e.stopPropagation(); onChange(items.filter(i => i.id !== item.id)); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 -m-1 text-slate-400 hover:text-red-500 transition-all ml-1"
                  aria-label={`Remove "${item.text}"`}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <input
            ref={inputRef}
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancel(); }}
            placeholder="Add checklist item..."
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
            <button onClick={handleAdd} disabled={!newItemText.trim()} className="px-3 py-1 text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
