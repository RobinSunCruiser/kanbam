'use client';

import { useState, useRef, useEffect } from 'react';
import { ChecklistItem } from '@/types/board';
import { nanoid } from 'nanoid';
import { PlusIcon, XIcon, CheckIcon, CircleIcon, GripVerticalIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableChecklistItem({ item, isReadOnly, onToggle, onRemove, dragLabel }: {
  item: ChecklistItem; isReadOnly: boolean; onToggle: (id: string) => void; onRemove: (id: string) => void; dragLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: isReadOnly });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${isDragging ? 'opacity-50' : ''} ${
        item.checked ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-50 dark:bg-slate-800/50'
      }`}
      onClick={() => !isReadOnly && onToggle(item.id)}
    >
      <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
        {item.checked
          ? <CheckIcon className="w-3.5 h-3.5 text-green-500 transition-colors" />
          : <CircleIcon className="w-3.5 h-3.5 text-slate-400 transition-colors" />}
      </span>
      <span className={`text-sm transition-colors ${
        item.checked ? 'line-through text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
      }`}>{item.text}</span>
      {!isReadOnly && (
        <div className="flex items-center ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
          <button
            {...attributes} {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing p-1.5 -m-1 text-slate-400 hover:text-slate-600 touch-none"
            aria-label={dragLabel}
          >
            <GripVerticalIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
            className="p-1.5 -m-1 text-slate-400 hover:text-red-500 touch-none"
            aria-label={`Remove ${item.text}`}
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface CardChecklistProps {
  items: ChecklistItem[];
  isReadOnly: boolean;
  onChange: (items: ChecklistItem[]) => void;
}

export default function CardChecklist({ items, isReadOnly, onChange }: CardChecklistProps) {
  const t = useTranslations('checklist');
  const tCommon = useTranslations('common');
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } })
  );

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    onChange([...items, { id: nanoid(), text: newItemText.trim(), checked: false }]);
    setNewItemText('');
    setIsAdding(false);
  };

  const handleCancel = () => { setIsAdding(false); setNewItemText(''); };

  const handleToggle = (itemId: string) => {
    onChange(items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const checkedCount = items.filter(item => item.checked).length;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
          {items.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
              {checkedCount}/{items.length}
            </span>
          )}
        </div>
        {!isReadOnly && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all" aria-label={t('addItem')}>
            <PlusIcon />
          </button>
        )}
      </div>

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableChecklistItem key={item.id} item={item} isReadOnly={isReadOnly} onToggle={handleToggle} onRemove={(id) => onChange(items.filter(i => i.id !== id))} dragLabel={t('dragItem')} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isAdding && (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <input ref={inputRef} type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancel(); }} placeholder={t('itemPlaceholder')} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">{tCommon('cancel')}</button>
            <button onClick={handleAdd} disabled={!newItemText.trim()} className="px-3 py-1 text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50">{tCommon('add')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
