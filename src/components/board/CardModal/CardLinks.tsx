'use client';

import { useState, useRef, useEffect } from 'react';
import { CardLink } from '@/types/board';
import { nanoid } from 'nanoid';
import { PlusIcon, XIcon, LinkIcon, GripVerticalIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLinkItem({ link, isReadOnly, onRemove, dragLabel }: {
  link: CardLink; isReadOnly: boolean; onRemove: (id: string) => void; dragLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id, disabled: isReadOnly });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full ${isDragging ? 'opacity-50' : ''}`}
    >
      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
        {link.name}
      </a>
      {!isReadOnly && (
        <div className="flex items-center ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
          <button
            {...attributes} {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 -m-1 text-slate-400 hover:text-slate-600 touch-none"
            aria-label={dragLabel}
          >
            <GripVerticalIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => onRemove(link.id)}
            className="p-1.5 -m-1 text-slate-400 hover:text-red-500 touch-none"
            aria-label={`Remove ${link.name}`}
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface CardLinksProps {
  links: CardLink[];
  isReadOnly: boolean;
  onChange: (links: CardLink[]) => void;
}

export default function CardLinks({ links, isReadOnly, onChange }: CardLinksProps) {
  const t = useTranslations('links');
  const tCommon = useTranslations('common');
  const [isAdding, setIsAdding] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } })
  );

  useEffect(() => {
    if (isAdding && nameInputRef.current) nameInputRef.current.focus();
  }, [isAdding]);

  const handleAdd = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) { setError(t('bothFieldsRequired')); return; }
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    try { new URL(url); } catch { setError(t('invalidUrl')); return; }
    onChange([...links, { id: nanoid(), name: newLinkName.trim(), url }]);
    setNewLinkName(''); setNewLinkUrl(''); setError(''); setIsAdding(false);
  };

  const handleCancel = () => { setIsAdding(false); setNewLinkName(''); setNewLinkUrl(''); setError(''); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex(link => link.id === active.id);
    const newIndex = links.findIndex(link => link.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(links, oldIndex, newIndex));
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('title')}</h3>
        {!isReadOnly && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all" aria-label={t('addLink')}>
            <PlusIcon />
          </button>
        )}
      </div>

      {links.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <SortableLinkItem key={link.id} link={link} isReadOnly={isReadOnly} onRemove={(id) => onChange(links.filter(l => l.id !== id))} dragLabel={t('dragLink')} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isAdding && (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <input ref={nameInputRef} type="text" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} placeholder={t('namePlaceholder')} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          <input type="text" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancel(); }} placeholder={t('urlPlaceholder')} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">{tCommon('cancel')}</button>
            <button onClick={handleAdd} className="px-3 py-1 text-sm text-orange-500 hover:text-orange-600 font-medium">{tCommon('add')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
