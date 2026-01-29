'use client';

import { useState, useTransition } from 'react';
import { createBoardAction } from '@/lib/actions/boards';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Modal from '../ui/Modal';

export default function CreateBoardButton() {
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
      <Button onClick={() => setIsOpen(true)}>
        + Create Board
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Board">
        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Board Title"
            name="title"
            placeholder="My Project Board"
            required
            autoFocus
          />

          <Textarea
            label="Description (optional)"
            name="description"
            placeholder="What is this board for?"
            rows={3}
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
