'use client';

import React, { useEffect, useId } from 'react';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Accessible modal dialog with focus trap and keyboard navigation.
 *
 * Features:
 * - Focus trap: Tab cycles through modal elements only
 * - Escape key closes the modal
 * - Click outside (backdrop) closes the modal
 * - Body scroll lock when open
 * - ARIA attributes for screen readers
 */
export default function Modal({ isOpen, onClose, title, header, children }: ModalProps) {
  const titleId = useId();
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative glass-heavy glass-glow rounded-2xl max-w-md w-full p-6 border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-slate-900/20 dark:shadow-black/40"
        >
          {(header || title) && (
            <div className="mb-5 pb-4 border-b border-slate-200 dark:border-slate-700">
              {header || (
                <h2
                  id={titleId}
                  className="text-xl font-semibold bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent"
                >
                  {title}
                </h2>
              )}
            </div>
          )}

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
