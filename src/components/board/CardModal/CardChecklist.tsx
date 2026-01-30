'use client';

import { useState } from 'react';
import { ChecklistItem } from '@/types/board';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { nanoid } from 'nanoid';

interface CardChecklistProps {
  items: ChecklistItem[];
  isReadOnly: boolean;
  onChange: (items: ChecklistItem[]) => void;
}

export default function CardChecklist({
  items,
  isReadOnly,
  onChange,
}: CardChecklistProps) {
  const [newItemText, setNewItemText] = useState('');

  const handleAdd = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: nanoid(),
      text: newItemText.trim(),
      checked: false,
    };
    onChange([...items, newItem]);
    setNewItemText('');
  };

  const handleToggle = (itemId: string) => {
    onChange(
      items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleRemove = (itemId: string) => {
    onChange(items.filter(item => item.id !== itemId));
  };

  const checkedCount = items.filter(item => item.checked).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Checklist
        </h3>
        {items.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {checkedCount}/{items.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                disabled={isReadOnly}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span
                className={`flex-1 text-sm ${
                  item.checked
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {item.text}
              </span>
              {!isReadOnly && (
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove item"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add checklist item..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button onClick={handleAdd} disabled={!newItemText.trim()}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
