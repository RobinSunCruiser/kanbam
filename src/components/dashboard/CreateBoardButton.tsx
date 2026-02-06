'use client';

import { useState, useTransition } from 'react';
import { createBoardAction } from '@/lib/actions/boards';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Modal from '../ui/Modal';
import { useTranslations } from 'next-intl';

export default function CreateBoardButton() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setError('');

    startTransition(async () => {
      const result = await createBoardAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Reset and close modal on success
        setIsOpen(false);
        setError('');
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setIsOpen(false);
      setError('');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t('newBoard')}</Button>

      <Modal isOpen={isOpen} onClose={handleClose} title={t('createBoardTitle')}>
        <form action={handleSubmit} className="space-y-5">
          <Input label={t('boardTitleLabel')} name="title" placeholder={t('boardTitlePlaceholder')} required autoFocus />
          <Textarea label={t('boardDescriptionLabel')} name="description" placeholder={t('boardDescriptionPlaceholder')} rows={2} />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>{tCommon('cancel')}</Button>
            <Button type="submit" disabled={isPending}>{isPending ? t('creating') : t('create')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
