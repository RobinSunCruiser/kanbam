'use client';

import { useState } from 'react';
import { ActivityNote } from '@/types/board';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { nanoid } from 'nanoid';

interface CardActivityProps {
  notes: ActivityNote[];
  isReadOnly: boolean;
  onChange: (notes: ActivityNote[]) => void;
  currentUserEmail: string;
}

export default function CardActivity({
  notes,
  isReadOnly,
  onChange,
  currentUserEmail,
}: CardActivityProps) {
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;

    const note: ActivityNote = {
      id: nanoid(),
      text: newNote.trim(),
      createdBy: currentUserEmail,
      createdAt: new Date().toISOString(),
    };
    onChange([...notes, note]);
    setNewNote('');
  };

  // Sort notes by newest first
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Activity
      </h3>

      {!isReadOnly && (
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
          />
          <Button
            onClick={handleAdd}
            disabled={!newNote.trim()}
            className="w-full"
          >
            Add Note
          </Button>
        </div>
      )}

      {sortedNotes.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{note.createdBy}</span>
                <span>{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No activity yet
        </p>
      )}
    </div>
  );
}
