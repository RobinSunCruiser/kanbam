'use client';

import { useState, useTransition, useCallback } from 'react';
import { updateBoardAction } from '@/lib/actions/boards';
import { useInlineEdit } from '@/lib/hooks/useInlineEdit';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('board');
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
  const {
    isEditing: isTitleEditing,
    value: titleValue,
    setValue: setTitleValue,
    inputRef: titleInputRef,
    startEditing: startTitleEditing,
    handleBlur: handleTitleBlur,
    handleKeyDown: handleTitleKeyDown,
  } = useInlineEdit<HTMLInputElement>({
    initialValue: title,
    onSave: (newTitle) => saveToServer({ title: newTitle }),
    disabled: isReadOnly || isPending,
    validate: (value) => value.length > 0,
  });

  const {
    isEditing: isDescriptionEditing,
    value: descriptionValue,
    setValue: setDescriptionValue,
    inputRef: descriptionInputRef,
    startEditing: startDescriptionEditing,
    handleBlur: handleDescriptionBlur,
    handleKeyDown: handleDescriptionKeyDown,
  } = useInlineEdit<HTMLInputElement>({
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
        {isTitleEditing ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            disabled={isReadOnly || isPending}
            className="text-xl font-semibold bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border-b-2 border-orange-400 outline-none"
            placeholder={t('boardTitlePlaceholder')}
            aria-label="Board title"
          />
        ) : (
          <h1
            onClick={startTitleEditing}
            onKeyDown={(e) => handleActivationKeyDown(e, startTitleEditing)}
            tabIndex={isReadOnly ? -1 : 0}
            className={`text-xl font-semibold text-slate-900 dark:text-slate-100 ${
              isReadOnly ? '' : 'cursor-text hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={isReadOnly ? title : t('clickToEdit')}
          >
            {titleValue}
          </h1>
        )}

        {/* Description - inline */}
        {isDescriptionEditing ? (
          <input
            ref={descriptionInputRef}
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            disabled={isReadOnly || isPending}
            className="flex-1 min-w-32 text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b border-orange-400 outline-none"
            placeholder={t('boardDescriptionPlaceholder')}
            aria-label="Board description"
          />
        ) : (
          <p
            onClick={startDescriptionEditing}
            onKeyDown={(e) => handleActivationKeyDown(e, startDescriptionEditing)}
            tabIndex={isReadOnly ? -1 : 0}
            className={`text-sm text-slate-500 dark:text-slate-400 ${
              isReadOnly ? '' : 'cursor-text hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={isReadOnly ? (descriptionValue || '') : t('clickToEdit')}
          >
            {descriptionValue || (!isReadOnly ? t('descriptionPlaceholder') : '')}
          </p>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
