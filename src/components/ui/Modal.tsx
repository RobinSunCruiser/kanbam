'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, header, children }: ModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-900/20 max-w-md w-full p-6 border border-slate-200/50 dark:border-slate-700/50">
          {(header || title) && (
            <div className="mb-5 pb-4 border-b border-slate-200 dark:border-slate-700">
              {header || (
                <h2 className="text-xl font-semibold bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
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
