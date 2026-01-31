'use client';

import { useState, useRef, useEffect } from 'react';
import { ActivityNote } from '@/types/board';
import { nanoid } from 'nanoid';
import { PlusIcon } from '@/components/ui/Icons';

interface CardActivityProps {
  notes: ActivityNote[];
  isReadOnly: boolean;
  onChange: (notes: ActivityNote[]) => void;
  currentUserEmail: string;
}

export default function CardActivity({ notes, isReadOnly, onChange, currentUserEmail }: CardActivityProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAdding && textareaRef.current) textareaRef.current.focus();
  }, [isAdding]);

  const handleAdd = () => {
    if (!newNote.trim()) return;
    onChange([...notes, {
      id: nanoid(),
      text: newNote.trim(),
      createdBy: currentUserEmail,
      createdAt: new Date().toISOString(),
    }]);
    setNewNote('');
    setIsAdding(false);
  };

  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Activity</h3>
        {!isReadOnly && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setIsAdding(false); setNewNote(''); } }}
            placeholder="Add a note..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setIsAdding(false); setNewNote(''); }} className="px-3 py-1 text-sm text-slate-500">Cancel</button>
            <button onClick={handleAdd} disabled={!newNote.trim()} className="px-3 py-1 text-sm text-orange-500 font-medium disabled:opacity-50">Add</button>
          </div>
        </div>
      )}

      {sortedNotes.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedNotes.map((note) => (
            <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">{note.createdBy.split('@')[0]}</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-3">No activity yet</p>
      )}
    </div>
  );
}
