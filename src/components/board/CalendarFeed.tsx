'use client';

import { useState } from 'react';
import { CalendarIcon } from '../ui/Icons';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { generateCalendarUrlAction } from '@/lib/actions/calendar';
import { useTranslations } from 'next-intl';

interface CalendarFeedProps {
  boardUid: string;
}

export default function CalendarFeed({ boardUid }: CalendarFeedProps) {
  const t = useTranslations('calendar');
  const tCommon = useTranslations('common');
  const [showModal, setShowModal] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOpen = async () => {
    setShowModal(true);
    if (calendarUrl) return;

    setLoading(true);
    setError('');

    try {
      const result = await generateCalendarUrlAction(boardUid);
      if (result.success) {
        setCalendarUrl(result.url);
      } else {
        setError(result.error || t('failedToGenerate'));
      }
    } catch {
      setError(t('failedToGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(calendarUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = calendarUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label={t('subscribe')}
        title={t('subscribe')}
      >
        <CalendarIcon className="w-4 h-4" />
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('title')}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('description')}
          </p>

          {loading && (
            <p className="text-sm text-slate-500">{tCommon('loading')}</p>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {calendarUrl && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(calendarUrl.replace(/^https?:\/\//, 'webcal://'), '_self')}
                  variant="primary"
                  className="flex-1"
                >
                  {t('subscribeAction')}
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                >
                  {copied ? t('copied') : t('copy')}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('copyHint')}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('securityWarning')}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {tCommon('close')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
