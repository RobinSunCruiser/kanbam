'use client';

import Modal from './Modal';
import Button from './Button';
import { useTranslations } from 'next-intl';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning';
  confirmText?: string;
  onClose: () => void;
}

/**
 * Alert dialog component
 * Replaces browser alert() with a styled, accessible dialog
 */
export default function AlertDialog({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText,
  onClose,
}: AlertDialogProps) {
  const t = useTranslations('common');
  const typeStyles = {
    info: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    error: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    success: 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className={`p-3 border rounded-lg ${typeStyles[type]}`}>
          <p>{message}</p>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            {confirmText || t('ok')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
