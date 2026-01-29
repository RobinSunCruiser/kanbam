'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, ColumnType } from '@/types/board';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  isReadOnly: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: { title?: string; description?: string }) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onCreate?: (data: { title: string; description: string; columnId: ColumnType }) => Promise<void>;
  columnId?: ColumnType;
}

export default function CardModal({
  card,
  isOpen,
  isReadOnly,
  onClose,
  onUpdate,
  onDelete,
  onCreate,
  columnId,
}: CardModalProps) {
  const isCreateMode = !card && onCreate && columnId;

  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
    } else {
      setTitle('');
      setDescription('');
    }
    setError('');
  }, [card]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
      if (isCreateMode && onCreate && columnId) {
        await onCreate({
          title: title.trim(),
          description: description.trim(),
          columnId,
        });
      } else if (card) {
        await onUpdate(card.id, {
          title: title.trim(),
          description: description.trim(),
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!card) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!card) return;

    setShowDeleteConfirm(false);
    setLoading(true);

    try {
      await onDelete(card.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete card');
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? 'Create Card' : isReadOnly ? 'View Card' : 'Edit Card'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title"
          required
          disabled={isReadOnly}
          autoFocus
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={4}
          disabled={isReadOnly}
        />

        {card && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Created {new Date(card.createdAt).toLocaleString()}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-between">
          <div>
            {card && !isReadOnly && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteClick}
                disabled={loading}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isCreateMode ? 'Create' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Card"
          message="Are you sure you want to delete this card? This action cannot be undone."
          variant="danger"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </Modal>
  );
}
