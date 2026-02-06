'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Board } from '@/types/board';
import { addBoardMemberAction, removeBoardMemberAction } from '@/lib/actions/boards';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import AlertDialog from '../ui/AlertDialog';
import { UsersIcon } from '../ui/Icons';
import { useTranslations } from 'next-intl';

interface BoardMembersProps {
  board: Board;
  userEmail: string;
  userPrivilege: 'read' | 'write';
}

export default function BoardMembers({
  board,
  userEmail,
  userPrivilege,
}: BoardMembersProps) {
  const router = useRouter();
  const t = useTranslations('members');
  const tCommon = useTranslations('common');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePrivilege, setInvitePrivilege] = useState<'read' | 'write'>('read');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const handleInvite = async () => {
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', inviteEmail);
      formData.append('privilege', invitePrivilege);

      const result = await addBoardMemberAction(board.uid, formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setInviteEmail('');
      setInvitePrivilege('read');
      setShowInviteModal(false);
      router.refresh();
    } catch {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveBoard = () => {
    setConfirmDialog({
      title: t('leaveBoard'),
      message: t('leaveBoardConfirmMessage'),
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoading(true);

        try {
          const result = await removeBoardMemberAction(board.uid, userEmail);

          if (result?.error) {
            setAlertDialog({
              title: tCommon('error'),
              message: result.error,
            });
            setLoading(false);
            return;
          }

          router.push('/dashboard');
        } catch {
          setAlertDialog({
            title: tCommon('error'),
            message: t('genericError'),
          });
          setLoading(false);
        }
      },
    });
  };

  const handleRemoveMember = (email: string) => {
    setConfirmDialog({
      title: t('removeMember'),
      message: t('removeMemberConfirm', { email }),
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoading(true);

        try {
          const result = await removeBoardMemberAction(board.uid, email);

          if (result?.error) {
            setAlertDialog({
              title: tCommon('error'),
              message: result.error,
            });
            setLoading(false);
            return;
          }

          router.refresh();
        } catch {
          setAlertDialog({
            title: tCommon('error'),
            message: t('genericError'),
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <>
      {/* Compact Members Button */}
      <button
        onClick={() => setShowMembersModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label={t('viewMembers', { count: board.members.length })}
      >
        <UsersIcon />
        <span>{t('title')}</span>
        <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-full">
          {board.members.length}
        </span>
      </button>

      {/* Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={t('boardMembers')}
      >
        <div className="space-y-4">
          {/* Member List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {board.members.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {member.email}
                    {member.email.toLowerCase() === userEmail.toLowerCase() && (
                      <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-normal">
                        {t('you')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {member.privilege === 'write' ? t('canEdit') : t('readOnly')}
                  </p>
                </div>
                {userPrivilege === 'write' &&
                  member.email.toLowerCase() !== userEmail.toLowerCase() && (
                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      disabled={loading}
                      className="ml-3 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                      aria-label={t('removeMember', { email: member.email })}
                    >
                      {t('remove')}
                    </button>
                  )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            {userPrivilege === 'write' && (
              <Button
                onClick={() => {
                  setShowMembersModal(false);
                  setShowInviteModal(true);
                }}
                className="flex-1"
              >
                {t('inviteMember')}
              </Button>
            )}
            <Button
              onClick={handleLeaveBoard}
              variant="secondary"
              disabled={loading}
              className="flex-1"
            >
              {t('leaveBoard')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={t('inviteMember')}
      >
        <div className="space-y-4">
          <Input
            type="email"
            label={t('emailLabel')}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('accessLevel')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input
                  type="radio"
                  value="read"
                  checked={invitePrivilege === 'read'}
                  onChange={(e) => setInvitePrivilege(e.target.value as 'read' | 'write')}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {t('readOnly')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t('readOnlyDescription')}
                  </p>
                </div>
              </label>
              <label className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input
                  type="radio"
                  value="write"
                  checked={invitePrivilege === 'write'}
                  onChange={(e) => setInvitePrivilege(e.target.value as 'read' | 'write')}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {t('canEdit')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t('canEditDescription')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setShowInviteModal(false)}
              variant="secondary"
              disabled={loading}
            >
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleInvite} disabled={loading || !inviteEmail.trim()}>
              {loading ? t('inviting') : t('sendInvite')}
            </Button>
          </div>
        </div>
      </Modal>

      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant="danger"
          confirmText={tCommon('confirm')}
          cancelText={tCommon('cancel')}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {alertDialog && (
        <AlertDialog
          isOpen={true}
          title={alertDialog.title}
          message={alertDialog.message}
          type="error"
          onClose={() => setAlertDialog(null)}
        />
      )}
    </>
  );
}
