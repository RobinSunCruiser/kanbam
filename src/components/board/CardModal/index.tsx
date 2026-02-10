'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, BoardMember, ChecklistItem, CardLink, ActivityNote } from '@/types/board';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CardChecklist from './CardChecklist';
import CardLinks from './CardLinks';
import CardDeadline from './CardDeadline';
import CardAssignee from './CardAssignee';
import CardActivity from './CardActivity';
import { sendAssignmentEmailAction } from '@/lib/actions/cards';
import { useTranslations } from 'next-intl';

interface CardModalProps {
  card: Card | null;
  boardMembers: BoardMember[];
  boardUid: string;
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
  onCreate?: (data: { title: string; description: string; columnId: string }) => Promise<void>;
  columnId?: string;
}

/**
 * Modal for viewing/editing card details or creating new cards.
 *
 * Features:
 * - Auto-saves changes (debounced for text, immediate for other fields)
 * - Sends email notification when assignee changes
 * - Supports read-only mode for users with view-only access
 */
export default function CardModal({
  card,
  boardMembers,
  boardUid,
  isOpen,
  isReadOnly,
  currentUserEmail,
  onClose,
  onUpdate,
  onDelete,
  onCreate,
  columnId,
}: CardModalProps) {
  const t = useTranslations('card');
  const tCommon = useTranslations('common');
  const isCreateMode = !card && onCreate && columnId;

  // Form state
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

  // Refs for tracking values without triggering re-renders
  const isInitialMount = useRef(true);
  const assigneeOnOpen = useRef('');
  const pendingEmailRef = useRef<{ boardUid: string; title: string; assignee: string } | null>(null);
  const cardIdRef = useRef<string | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const cardRef = useRef(card);

  // Keep refs in sync without causing re-renders
  cardIdRef.current = card?.id ?? null;
  onUpdateRef.current = onUpdate;
  cardRef.current = card;

  // Ref to hold latest state for save function (avoids stale closures)
  const stateRef = useRef({ title, description, assignee, deadline, checklist, links, activity });
  stateRef.current = { title, description, assignee, deadline, checklist, links, activity };

  // Initialize form when card changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    isInitialMount.current = true;
    setError('');
    setIsSaving(false);

    const currentCard = cardRef.current;
    if (currentCard) {
      setTitle(currentCard.title);
      setDescription(currentCard.description);
      setAssignee(currentCard.assignee || '');
      assigneeOnOpen.current = currentCard.assignee || '';
      setDeadline(currentCard.deadline || '');
      setChecklist(currentCard.checklist || []);
      setLinks(currentCard.links || []);
      setActivity(currentCard.activity || []);
    } else {
      // Create mode or no card - reset to empty
      setTitle('');
      setDescription('');
      setAssignee('');
      assigneeOnOpen.current = '';
      setDeadline('');
      setChecklist([]);
      setLinks([]);
      setActivity([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, card?.id]);

  // Cleanup when modal closes
  useEffect(() => {
    if (isOpen) return;

    setShowDeleteConfirm(false);

    // Send assignment email if assignee changed during this session
    if (pendingEmailRef.current) {
      const { boardUid: uid, title: cardTitle, assignee: newAssignee } = pendingEmailRef.current;
      sendAssignmentEmailAction(uid, cardTitle, newAssignee);
      pendingEmailRef.current = null;
    }
  }, [isOpen]);

  // Track assignee changes for email notification
  useEffect(() => {
    if (assignee && assignee !== assigneeOnOpen.current) {
      pendingEmailRef.current = { boardUid, title, assignee };
    } else {
      pendingEmailRef.current = null;
    }
  }, [assignee, boardUid, title]);

  // Auto-save function - uses refs to avoid stale closures and prevent re-creation loops
  const saveCard = useCallback(async () => {
    const state = stateRef.current;
    const cardId = cardIdRef.current;
    if (!cardId || !state.title.trim() || isReadOnly) return;

    try {
      await onUpdateRef.current(cardId, {
        title: state.title.trim(),
        description: state.description.trim(),
        assignee: state.assignee, // Send empty string, not undefined
        deadline: state.deadline || null,
        checklist: state.checklist,
        links: state.links,
        activity: state.activity,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
    }
  }, [isReadOnly]);

  // Debounced auto-save for text fields (title, description)
  useEffect(() => {
    if (!card?.id || isCreateMode || isReadOnly || !title.trim()) return;
    // Skip if values haven't changed from what's already saved
    if (title === card.title && description === card.description) return;

    const timeout = setTimeout(saveCard, 1000);
    return () => clearTimeout(timeout);
  }, [card?.id, card?.title, card?.description, isCreateMode, isReadOnly, title, description, saveCard]);

  // Immediate save for non-text fields
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!cardIdRef.current || isCreateMode || isReadOnly || !stateRef.current.title.trim()) return;

    // Skip if values haven't changed from what's already saved
    const currentCard = cardRef.current;
    if (currentCard) {
      const sameAssignee = assignee === (currentCard.assignee || '');
      const sameDeadline = deadline === (currentCard.deadline || '');
      const sameChecklist = JSON.stringify(checklist) === JSON.stringify(currentCard.checklist || []);
      const sameLinks = JSON.stringify(links) === JSON.stringify(currentCard.links || []);
      const sameActivity = JSON.stringify(activity) === JSON.stringify(currentCard.activity || []);
      if (sameAssignee && sameDeadline && sameChecklist && sameLinks && sameActivity) return;
    }

    saveCard();
  }, [assignee, deadline, checklist, links, activity, isCreateMode, isReadOnly, saveCard]);

  // Handle create mode submission
  const handleCreate = async () => {
    if (!title.trim()) {
      setError(t('titleRequired'));
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
      const errorMessage = err instanceof Error ? err.message : t('createFailed');
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
      const errorMessage = err instanceof Error ? err.message : t('deleteFailed');
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  const headerContent = isCreateMode ? undefined : (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder={t('cardTitlePlaceholder')}
      disabled={isReadOnly}
      className="w-full text-xl font-semibold bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border-none outline-none"
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? t('createCard') : undefined}
      header={headerContent}
    >
      <div className="space-y-5">
        {isCreateMode && (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('cardTitlePlaceholder')}
            variant="seamless"
            className="text-xl font-semibold"
            required
          />
        )}

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          rows={1}
          disabled={isReadOnly}
          variant="seamless"
          autoResize
          maxRows={10}
        />

        {!isCreateMode && (
          <>
            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700" />

            <div className="space-y-0">
              <CardChecklist items={checklist} isReadOnly={isReadOnly} onChange={setChecklist} />
              <CardLinks links={links} isReadOnly={isReadOnly} onChange={setLinks} />
              <CardDeadline deadline={deadline} isReadOnly={isReadOnly} onChange={setDeadline} />
              <CardAssignee assignee={assignee} boardMembers={boardMembers} isReadOnly={isReadOnly} onChange={setAssignee} />
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
                {tCommon('delete')}
              </button>
            )}
            {card && (
              <span className="text-xs text-slate-400">
                {t('created', { date: new Date(card.createdAt).toLocaleDateString() })}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {isCreateMode ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  {tCommon('cancel')}
                </Button>
                <Button type="button" onClick={handleCreate} disabled={isSaving || !title.trim()}>
                  {isSaving ? t('creating') : tCommon('create')}
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
              >
                {tCommon('close')}
              </button>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title={t('deleteCardTitle')}
          message={t('deleteCardConfirm')}
          variant="danger"
          confirmText={tCommon('delete')}
          cancelText={tCommon('cancel')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </Modal>
  );
}
