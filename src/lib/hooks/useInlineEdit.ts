import { useState, useRef, useEffect, useCallback, RefObject, useOptimistic } from 'react';

interface UseInlineEditOptions {
  /** Initial value for the input */
  initialValue: string;
  /** Callback when value is saved (Enter or blur) */
  onSave: (value: string) => void | Promise<void>;
  /** Whether editing is disabled */
  disabled?: boolean;
  /** Validate value before saving (return true if valid) */
  validate?: (value: string) => boolean;
}

interface UseInlineEditReturn<T extends HTMLInputElement | HTMLTextAreaElement> {
  /** Whether currently in edit mode */
  isEditing: boolean;
  /** Current value being edited */
  value: string;
  /** Set the value */
  setValue: (value: string) => void;
  /** Ref to attach to the input element */
  inputRef: RefObject<T | null>;
  /** Start editing (call on click) */
  startEditing: () => void;
  /** Cancel editing and revert to original value */
  cancelEditing: () => void;
  /** Save the current value and exit edit mode */
  saveAndClose: () => void;
  /** Keyboard handler for the input (Enter saves, Escape cancels) */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Blur handler for the input */
  handleBlur: () => void;
}

/**
 * Hook for managing inline editable text fields.
 *
 * Provides state management, keyboard handlers, and auto-focus for fields
 * that can be clicked to edit (like titles and descriptions).
 *
 * @example
 * ```tsx
 * const {
 *   isEditing, value, setValue, inputRef,
 *   startEditing, handleKeyDown, handleBlur
 * } = useInlineEdit({
 *   initialValue: title,
 *   onSave: (newTitle) => updateTitle(newTitle),
 * });
 *
 * return isEditing ? (
 *   <input
 *     ref={inputRef}
 *     value={value}
 *     onChange={(e) => setValue(e.target.value)}
 *     onKeyDown={handleKeyDown}
 *     onBlur={handleBlur}
 *   />
 * ) : (
 *   <h1 onClick={startEditing}>{title}</h1>
 * );
 * ```
 */
export function useInlineEdit<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(
  options: UseInlineEditOptions
): UseInlineEditReturn<T> {
  const { initialValue, onSave, disabled = false, validate } = options;

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useOptimistic(
    initialValue,
    (_current, nextValue: string) => nextValue
  );
  const inputRef = useRef<T>(null);
  const snapshotRef = useRef(initialValue);
  const skipBlurSaveRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      snapshotRef.current = initialValue;
    }
  }, [initialValue, isEditing]);

  // Auto-focus and select when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = useCallback(() => {
    if (disabled) return;
    snapshotRef.current = value;
    setIsEditing(true);
  }, [disabled, value]);

  const cancelEditing = useCallback(() => {
    setValue(snapshotRef.current);
    setIsEditing(false);
  }, [setValue]);

  const saveAndClose = useCallback(() => {
    const trimmed = value.trim();
    setIsEditing(false);

    // Don't save empty values - revert instead
    if (!trimmed) {
      setValue(snapshotRef.current);
      return;
    }

    // Don't save if unchanged
    if (trimmed === snapshotRef.current) {
      setValue(trimmed);
      return;
    }

    // Don't save if validation fails
    if (validate && !validate(trimmed)) {
      setValue(snapshotRef.current);
      return;
    }

    setValue(trimmed);
    onSave(trimmed);
  }, [value, validate, onSave, setValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      saveAndClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      skipBlurSaveRef.current = true;
      cancelEditing();
    }
  }, [saveAndClose, cancelEditing]);

  const handleBlur = useCallback(() => {
    if (skipBlurSaveRef.current) {
      skipBlurSaveRef.current = false;
      return;
    }
    saveAndClose();
  }, [saveAndClose]);

  return {
    isEditing,
    value,
    setValue,
    inputRef,
    startEditing,
    cancelEditing,
    saveAndClose,
    handleKeyDown,
    handleBlur,
  };
}
