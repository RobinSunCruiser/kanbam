'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { updateBoardAction } from '@/lib/actions/boards';

interface BoardHeaderProps {
  boardUid: string;
  title: string;
  description?: string | null;
  isReadOnly: boolean;
}

export default function BoardHeader({
  boardUid,
  title,
  description,
  isReadOnly,
}: BoardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [descriptionValue, setDescriptionValue] = useState(description ?? '');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const refs = useRef({
    skipBlurSave: false,
    persisted: { title, description: description ?? '' },
    snapshot: { title, description: description ?? '' },
  });

  useEffect(() => {
    setTitleValue(title);
    setDescriptionValue(description ?? '');
    refs.current.persisted = { title, description: description ?? '' };
  }, [title, description]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
      return;
    }
    if (isEditingDescription) {
      descriptionRef.current?.focus();
      descriptionRef.current?.select();
    }
  }, [isEditingTitle, isEditingDescription]);

  const saveUpdates = (updates: { title?: string; description?: string }) => {
    if (isReadOnly) return;

    startTransition(async () => {
      setError('');
      const formData = new FormData();
      if (updates.title !== undefined) {
        formData.append('title', updates.title);
      }
      if (updates.description !== undefined) {
        formData.append('description', updates.description);
      }

      const result = await updateBoardAction(boardUid, formData);

      if (result?.error) {
        setError(result.error);
        setTitleValue(refs.current.persisted.title);
        setDescriptionValue(refs.current.persisted.description);
        return;
      }

      if (updates.title !== undefined) {
        refs.current.persisted.title = updates.title;
      }
      if (updates.description !== undefined) {
        refs.current.persisted.description = updates.description;
      }
    });
  };

  const handleTitleSave = () => {
    if (refs.current.skipBlurSave) {
      refs.current.skipBlurSave = false;
      setIsEditingTitle(false);
      return;
    }

    const trimmed = titleValue.trim();
    setIsEditingTitle(false);

    if (!trimmed) {
      setTitleValue(refs.current.persisted.title);
      return;
    }

    if (trimmed === refs.current.persisted.title) {
      setTitleValue(trimmed);
      return;
    }

    setTitleValue(trimmed);
    saveUpdates({ title: trimmed });
  };

  const handleDescriptionSave = () => {
    if (refs.current.skipBlurSave) {
      refs.current.skipBlurSave = false;
      return;
    }

    setIsEditingDescription(false);
    const nextValue = descriptionValue.trim();

    if (nextValue === refs.current.persisted.description) {
      setDescriptionValue(nextValue);
      return;
    }

    setDescriptionValue(nextValue);
    saveUpdates({ description: nextValue });
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTitleSave();
    } else if (event.key === 'Escape') {
      refs.current.skipBlurSave = true;
      setTitleValue(refs.current.snapshot.title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      refs.current.skipBlurSave = true;
      setDescriptionValue(refs.current.snapshot.description);
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="min-w-0">
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          value={titleValue}
          onChange={(event) => setTitleValue(event.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={handleTitleKeyDown}
          disabled={isReadOnly || isPending}
          className="w-full text-3xl font-bold bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-slate-400 border-2 border-transparent rounded-lg px-2 py-1 -mx-2 -my-1 outline-none focus:border-orange-400 focus:bg-orange-50/50 dark:focus:bg-orange-900/10 transition-colors"
          placeholder="Board title"
        />
      ) : (
        <h1
          onClick={() => {
            if (isReadOnly) return;
            refs.current.snapshot = { ...refs.current.snapshot, title: titleValue };
            setIsEditingTitle(true);
          }}
          onKeyDown={(event) => {
            if (!isReadOnly && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              refs.current.snapshot = { ...refs.current.snapshot, title: titleValue };
              setIsEditingTitle(true);
            }
          }}
          tabIndex={isReadOnly ? -1 : 0}
          className={`text-3xl font-bold text-gray-900 dark:text-gray-100 ${
            isReadOnly ? '' : 'cursor-text hover:text-orange-600 dark:hover:text-orange-400'
          }`}
          title={isReadOnly ? title : 'Click to edit'}
        >
          {titleValue}
        </h1>
      )}

      {isEditingDescription ? (
        <textarea
          ref={descriptionRef}
          value={descriptionValue}
          onChange={(event) => setDescriptionValue(event.target.value)}
          onBlur={handleDescriptionSave}
          onKeyDown={handleDescriptionKeyDown}
          disabled={isReadOnly || isPending}
          rows={2}
          className="mt-2 w-full text-gray-600 dark:text-gray-400 bg-transparent border-2 border-transparent rounded-lg px-2 py-1 -mx-2 outline-none focus:border-orange-400 focus:bg-orange-50/50 dark:focus:bg-orange-900/10 transition-colors resize-none"
          placeholder="Add a description..."
        />
      ) : (
        <p
          onClick={() => {
            if (isReadOnly) return;
            refs.current.snapshot = { ...refs.current.snapshot, description: descriptionValue };
            setIsEditingDescription(true);
          }}
          onKeyDown={(event) => {
            if (!isReadOnly && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              refs.current.snapshot = { ...refs.current.snapshot, description: descriptionValue };
              setIsEditingDescription(true);
            }
          }}
          tabIndex={isReadOnly ? -1 : 0}
          className={`mt-1 text-gray-600 dark:text-gray-400 ${
            isReadOnly ? '' : 'cursor-text hover:text-orange-600 dark:hover:text-orange-400'
          }`}
          title={isReadOnly ? (descriptionValue || '') : 'Click to edit'}
        >
          {descriptionValue || (!isReadOnly ? 'Add a description...' : '')}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
