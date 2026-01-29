'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Modal from '../ui/Modal';

export default function CreateBoardButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create board');
        setLoading(false);
        return;
      }

      // Reset form
      setTitle('');
      setDescription('');
      setIsOpen(false);
      setLoading(false);

      // Refresh the page to show new board
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setError('');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        + Create Board
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Board">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Project Board"
            required
            autoFocus
          />

          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
