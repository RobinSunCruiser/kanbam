'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

/**
 * Modal for creating a new column with a custom title.
 * Follows the same pattern as CardModal for consistency.
 */
export default function ColumnDialog({ isOpen, onClose, onCreate }: ColumnDialogProps) {
  const t = useTranslations('board');
  const tCommon = useTranslations('common');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setError('');
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError(t('columnTitleRequired'));
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onCreate(title.trim());
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('createFailed');
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleCreate();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('createColumn')}>
      <div className="space-y-5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('columnTitlePlaceholder')}
          autoFocus
          disabled={isSaving}
          error={error}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleCreate}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? t('creating') : tCommon('create')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
