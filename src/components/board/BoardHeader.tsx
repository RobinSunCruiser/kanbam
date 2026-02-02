'use client';

import { useState, useTransition, useCallback } from 'react';
import { updateBoardAction } from '@/lib/actions/boards';
import { useInlineEdit } from '@/lib/hooks/useInlineEdit';

interface BoardHeaderProps {
  boardUid: string;
  title: string;
  description?: string | null;
  isReadOnly: boolean;
}

/**
 * Editable board header with title and description.
 *
 * Click to edit when not in read-only mode. Changes are saved automatically
 * on blur or Enter key. Escape cancels the edit.
 */
export default function BoardHeader({
  boardUid,
  title,
  description,
  isReadOnly,
}: BoardHeaderProps) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Persist updates to the server
  const saveToServer = useCallback(
    (updates: { title?: string; description?: string }) => {
      startTransition(async () => {
        setError('');
        const formData = new FormData();
        if (updates.title !== undefined) formData.append('title', updates.title);
        if (updates.description !== undefined) formData.append('description', updates.description);

        const result = await updateBoardAction(boardUid, formData);
        if (result?.error) {
          setError(result.error);
        }
      });
    },
    [boardUid]
  );

  // Title inline edit
  const titleEdit = useInlineEdit<HTMLInputElement>({
    initialValue: title,
    onSave: (newTitle) => saveToServer({ title: newTitle }),
    disabled: isReadOnly || isPending,
    validate: (value) => value.length > 0,
  });

  // Description inline edit
  const descriptionEdit = useInlineEdit<HTMLInputElement>({
    initialValue: description ?? '',
    onSave: (newDescription) => saveToServer({ description: newDescription }),
    disabled: isReadOnly || isPending,
  });

  // Handle keyboard activation for non-editable elements
  const handleActivationKeyDown = (
    e: React.KeyboardEvent,
    startEditing: () => void
  ) => {
    if (!isReadOnly && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      startEditing();
    }
  };

  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-3 flex-wrap">
        {/* Title */}
        {titleEdit.isEditing ? (
          <input
            ref={titleEdit.inputRef}
            value={titleEdit.value}
            onChange={(e) => titleEdit.setValue(e.target.value)}
            onBlur={titleEdit.handleBlur}
            onKeyDown={titleEdit.handleKeyDown}
            disabled={isReadOnly || isPending}
            className="text-xl font-semibold bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border-b-2 border-orange-400 outline-none"
            placeholder="Board title"
            aria-label="Board title"
          />
        ) : (
          <h1
            onClick={titleEdit.startEditing}
            onKeyDown={(e) => handleActivationKeyDown(e, titleEdit.startEditing)}
            tabIndex={isReadOnly ? -1 : 0}
            className={`text-xl font-semibold text-slate-900 dark:text-slate-100 ${
              isReadOnly ? '' : 'cursor-text hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={isReadOnly ? title : 'Click to edit'}
          >
            {titleEdit.value}
          </h1>
        )}

        {/* Description - inline */}
        {descriptionEdit.isEditing ? (
          <input
            ref={descriptionEdit.inputRef}
            value={descriptionEdit.value}
            onChange={(e) => descriptionEdit.setValue(e.target.value)}
            onBlur={descriptionEdit.handleBlur}
            onKeyDown={descriptionEdit.handleKeyDown}
            disabled={isReadOnly || isPending}
            className="flex-1 min-w-32 text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b border-orange-400 outline-none"
            placeholder="Add a description..."
            aria-label="Board description"
          />
        ) : (
          <p
            onClick={descriptionEdit.startEditing}
            onKeyDown={(e) => handleActivationKeyDown(e, descriptionEdit.startEditing)}
            tabIndex={isReadOnly ? -1 : 0}
            className={`text-sm text-slate-500 dark:text-slate-400 ${
              isReadOnly ? '' : 'cursor-text hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={isReadOnly ? (descriptionEdit.value || '') : 'Click to edit'}
          >
            {descriptionEdit.value || (!isReadOnly ? 'Add description...' : '')}
          </p>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
