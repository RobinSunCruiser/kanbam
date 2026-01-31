'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, ColumnType, BoardMember, ChecklistItem, CardLink, ActivityNote } from '@/types/board';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { PlusIcon, XIcon, CalendarIcon, UserIcon } from '@/components/ui/Icons';
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssigneeSelect, setShowAssigneeSelect] = useState(false);
  const deadlineInputRef = useRef<HTMLInputElement>(null);
  const assigneeSelectRef = useRef<HTMLSelectElement>(null);
  const isInitialMount = useRef(true);

  // Initialize from card prop
  useEffect(() => {
    isInitialMount.current = true; // Reset on card change
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
    setIsSaving(false);
  }, [card]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  // Auto-save function (silent background save)
  const saveCard = async () => {
    if (!card || !title.trim() || isReadOnly) return;

    try {
      await onUpdate(card.id, {
        title: title.trim(),
        description: description.trim(),
        assignee: assignee || undefined,
        deadline: deadline || null,
        checklist,
        links,
        activity,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
    }
  };

  // Debounced auto-save for text fields (title, description)
  useEffect(() => {
    if (!card || isCreateMode || isReadOnly || !title.trim()) return;

    const timeout = setTimeout(() => {
      saveCard();
    }, 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  // Immediate save for non-text fields (assignee, deadline, checklist, links, activity)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!card || isCreateMode || isReadOnly || !title.trim()) return;

    saveCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignee, deadline, checklist, links, activity]);

  // Handle create mode submission
  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (onCreate && columnId) {
        await onCreate({
          title: title.trim(),
          description: description.trim(),
          columnId,
        });
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create card';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (!card) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!card) return;

    setShowDeleteConfirm(false);
    setIsSaving(true);

    try {
      await onDelete(card.id);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete card';
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  const headerContent = isCreateMode ? undefined : (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Card title"
      disabled={isReadOnly}
      className="w-full text-xl font-semibold bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border-2 border-transparent rounded-lg px-2 py-1 -mx-2 -my-1 outline-none focus:border-orange-400 focus:bg-orange-50/50 dark:focus:bg-orange-900/10 transition-colors"
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? 'Create Card' : undefined}
      header={headerContent}
    >
      <div className="space-y-5">
        {isCreateMode && (
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
            required
            autoFocus
          />
        )}

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
          disabled={isReadOnly}
        />

        {!isCreateMode && (
          <>
            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700" />

            <CardChecklist items={checklist} isReadOnly={isReadOnly} onChange={setChecklist} />

            <CardLinks links={links} isReadOnly={isReadOnly} onChange={setLinks} />

            {/* Deadline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Deadline</h3>
                {!isReadOnly && !deadline && (
                  <button
                    onClick={() => deadlineInputRef.current?.showPicker()}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                  >
                    <PlusIcon />
                  </button>
                )}
                <input
                  ref={deadlineInputRef}
                  type="date"
                  className="sr-only"
                  onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
                />
              </div>
              {deadline && (
                <div className="flex flex-wrap gap-2">
                  <div className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {new Date(deadline).toLocaleDateString()}
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() => setDeadline('')}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all ml-1"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Assignee */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Assignee</h3>
                {!isReadOnly && !assignee && (
                  <button
                    onClick={() => {
                      setShowAssigneeSelect(true);
                      setTimeout(() => assigneeSelectRef.current?.focus(), 0);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                  >
                    <PlusIcon />
                  </button>
                )}
              </div>
              {assignee ? (
                <div className="flex flex-wrap gap-2">
                  <div className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {assignee}
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() => setAssignee('')}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all ml-1"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : showAssigneeSelect && (
                <select
                  ref={assigneeSelectRef}
                  value=""
                  onChange={(e) => {
                    setAssignee(e.target.value);
                    setShowAssigneeSelect(false);
                  }}
                  onBlur={() => setShowAssigneeSelect(false)}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-slate-100 transition-all"
                >
                  <option value="">Select...</option>
                  {boardMembers.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700" />

            <CardActivity notes={activity} isReadOnly={isReadOnly} currentUserEmail={currentUserEmail} onChange={setActivity} />
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {card && !isReadOnly && (
              <button
                onClick={handleDeleteClick}
                disabled={isSaving}
                className="text-sm text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            )}
            {card && (
              <span className="text-xs text-slate-400">
                Created {new Date(card.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            {isCreateMode && (
              <Button type="button" onClick={handleCreate} disabled={isSaving || !title.trim()}>
                {isSaving ? 'Creating...' : 'Create'}
              </Button>
            )}
          </div>
        </div>
      </div>

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
