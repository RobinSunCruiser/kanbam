'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/types/board';
import { addBoardMemberAction, removeBoardMemberAction } from '@/lib/actions/boards';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import AlertDialog from '../ui/AlertDialog';

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
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveBoard = () => {
    setConfirmDialog({
      title: 'Leave Board',
      message: 'Are you sure you want to leave this board?',
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoading(true);

        try {
          const result = await removeBoardMemberAction(board.uid, userEmail);

          if (result?.error) {
            setAlertDialog({
              title: 'Error',
              message: result.error,
            });
            setLoading(false);
            return;
          }

          router.push('/dashboard');
        } catch (err) {
          setAlertDialog({
            title: 'Error',
            message: 'An error occurred. Please try again.',
          });
          setLoading(false);
        }
      },
    });
  };

  const handleRemoveMember = (email: string) => {
    setConfirmDialog({
      title: 'Remove Member',
      message: `Remove ${email} from this board?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoading(true);

        try {
          const result = await removeBoardMemberAction(board.uid, email);

          if (result?.error) {
            setAlertDialog({
              title: 'Error',
              message: result.error,
            });
            setLoading(false);
            return;
          }

          router.refresh();
        } catch (err) {
          setAlertDialog({
            title: 'Error',
            message: 'An error occurred. Please try again.',
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
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span>Members</span>
        <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-full">
          {board.members.length}
        </span>
      </button>

      {/* Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Board Members"
      >
        <div className="space-y-4">
          {/* Member List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {board.members.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {member.email}
                    {member.email.toLowerCase() === userEmail.toLowerCase() && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-normal">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {member.privilege === 'write' ? 'Can edit' : 'Read only'}
                  </p>
                </div>
                {userPrivilege === 'write' &&
                  member.email.toLowerCase() !== userEmail.toLowerCase() && (
                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      disabled={loading}
                      className="ml-3 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {userPrivilege === 'write' && (
              <Button
                onClick={() => {
                  setShowMembersModal(false);
                  setShowInviteModal(true);
                }}
                className="flex-1"
              >
                Invite Member
              </Button>
            )}
            <Button
              onClick={handleLeaveBoard}
              variant="secondary"
              disabled={loading}
              className="flex-1"
            >
              Leave Board
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member"
      >
        <div className="space-y-4">
          <Input
            type="email"
            label="Email Address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Level
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  value="read"
                  checked={invitePrivilege === 'read'}
                  onChange={(e) => setInvitePrivilege(e.target.value as 'read' | 'write')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Read only
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Can view cards but not edit
                  </p>
                </div>
              </label>
              <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  value="write"
                  checked={invitePrivilege === 'write'}
                  onChange={(e) => setInvitePrivilege(e.target.value as 'read' | 'write')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Can edit
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Full access to add, edit, and delete cards
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
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={loading || !inviteEmail.trim()}>
              {loading ? 'Inviting...' : 'Send Invite'}
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
          confirmText="Confirm"
          cancelText="Cancel"
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
