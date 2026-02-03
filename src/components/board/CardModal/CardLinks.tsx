'use client';

import { useState, useRef, useEffect } from 'react';
import { CardLink } from '@/types/board';
import { nanoid } from 'nanoid';
import { PlusIcon, XIcon, LinkIcon } from '@/components/ui/Icons';

interface CardLinksProps {
  links: CardLink[];
  isReadOnly: boolean;
  onChange: (links: CardLink[]) => void;
}

export default function CardLinks({ links, isReadOnly, onChange }: CardLinksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && nameInputRef.current) nameInputRef.current.focus();
  }, [isAdding]);

  const handleAdd = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) {
      setError('Both fields required');
      return;
    }
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    try {
      new URL(url);
    } catch {
      setError('Invalid URL');
      return;
    }
    onChange([...links, { id: nanoid(), name: newLinkName.trim(), url }]);
    setNewLinkName('');
    setNewLinkUrl('');
    setError('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewLinkName('');
    setNewLinkUrl('');
    setError('');
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Links</h3>
        {!isReadOnly && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
            aria-label="Add link"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <div key={link.id} className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                {link.name}
              </a>
              {!isReadOnly && (
                <button
                  onClick={() => onChange(links.filter(l => l.id !== link.id))}
                  className="opacity-0 group-hover:opacity-100 p-1.5 -m-1 text-slate-400 hover:text-red-500 transition-all ml-1"
                  aria-label={`Remove link "${link.name}"`}
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
            ref={nameInputRef}
            type="text"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
            placeholder="Link name"
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <input
            type="text"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancel(); }}
            placeholder="URL"
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
            <button onClick={handleAdd} className="px-3 py-1 text-sm text-orange-500 hover:text-orange-600 font-medium">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
