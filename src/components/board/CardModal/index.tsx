'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, ColumnType, BoardMember, ChecklistItem, CardLink, ActivityNote } from '@/types/board';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CardChecklist from './CardChecklist';
import CardLinks from './CardLinks';
import CardActivity from './CardActivity';

interface CardModalProps {
  card: Card | null;
  boardMembers: BoardMember[];
  isOpen: boolean;
  isReadOnly: boolean;
  currentUserEmail: string;
  onClose: () => void;
  onUpdate: (cardId: string, updates: {
    title?: string;
    description?: string;
    assignee?: string;
    deadline?: string | null;
    checklist?: ChecklistItem[];
    links?: CardLink[];
    activity?: ActivityNote[];
  }) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onCreate?: (data: { title: string; description: string; columnId: ColumnType }) => Promise<void>;
  columnId?: ColumnType;
}

export default function CardModal({
  card,
  boardMembers,
  isOpen,
  isReadOnly,
  currentUserEmail,
  onClose,
  onUpdate,
  onDelete,
  onCreate,
  columnId,
}: CardModalProps) {
  const isCreateMode = !card && onCreate && columnId;

  // All fields managed in local state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [links, setLinks] = useState<CardLink[]>([]);
  const [activity, setActivity] = useState<ActivityNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize from card prop
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setAssignee(card.assignee || '');
      setDeadline(card.deadline || '');
      setChecklist(card.checklist || []);
      setLinks(card.links || []);
      setActivity(card.activity || []);
    } else {
      setTitle('');
      setDescription('');
      setAssignee('');
      setDeadline('');
      setChecklist([]);
      setLinks([]);
      setActivity([]);
    }
    setError('');
    setLoading(false);
  }, [card]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

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
        // Save all fields at once
        await onUpdate(card.id, {
          title: title.trim(),
          description: description.trim(),
          assignee: assignee || undefined,
          deadline: deadline || null,
          checklist,
          links,
          activity,
        });
      }

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete card';
      setError(errorMessage);
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

        {!isCreateMode && (
          <>
            <Select
              label="Assigned to"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={isReadOnly}
            >
              <option value="">Unassigned</option>
              {boardMembers.map((member) => (
                <option key={member.email} value={member.email}>
                  {member.email}
                </option>
              ))}
            </Select>

            <Input
              label="Deadline"
              type="date"
              value={deadline ? new Date(deadline).toISOString().split('T')[0] : ''}
              onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
              disabled={isReadOnly}
            />

            <CardChecklist
              items={checklist}
              isReadOnly={isReadOnly}
              onChange={setChecklist}
            />

            <CardLinks
              links={links}
              isReadOnly={isReadOnly}
              onChange={setLinks}
            />

            <CardActivity
              notes={activity}
              isReadOnly={isReadOnly}
              currentUserEmail={currentUserEmail}
              onChange={setActivity}
            />
          </>
        )}

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
