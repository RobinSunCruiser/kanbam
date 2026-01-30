'use client';

import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog component
 * Replaces browser confirm() with a styled, accessible dialog
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-5">
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button type="button" variant={variant} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  );
}
