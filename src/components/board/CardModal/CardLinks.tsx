'use client';

import { useState } from 'react';
import { CardLink } from '@/types/board';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { nanoid } from 'nanoid';

interface CardLinksProps {
  links: CardLink[];
  isReadOnly: boolean;
  onChange: (links: CardLink[]) => void;
}

export default function CardLinks({
  links,
  isReadOnly,
  onChange,
}: CardLinksProps) {
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) {
      setError('Both name and URL are required');
      return;
    }

    // Add https:// if no protocol is provided
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    const newLink: CardLink = {
      id: nanoid(),
      name: newLinkName.trim(),
      url: url,
    };
    onChange([...links, newLink]);
    setNewLinkName('');
    setNewLinkUrl('');
    setError('');
  };

  const handleRemove = (linkId: string) => {
    onChange(links.filter(link => link.id !== linkId));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Links
      </h3>

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                title={link.url}
              >
                {link.name}
              </a>
              {!isReadOnly && (
                <button
                  onClick={() => handleRemove(link.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove link"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="Link name"
            />
            <Input
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="example.com"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <Button
            onClick={handleAdd}
            disabled={!newLinkName.trim() || !newLinkUrl.trim()}
            className="w-full"
          >
            Add Link
          </Button>
        </div>
      )}
    </div>
  );
}
