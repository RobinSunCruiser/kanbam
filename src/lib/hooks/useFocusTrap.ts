import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  /** Whether to auto-focus the first focusable element when trap activates (default: false) */
  autoFocus?: boolean;
}

/**
 * Custom hook that traps focus within a container element.
 *
 * When enabled, Tab and Shift+Tab navigation will cycle through focusable
 * elements inside the container, preventing focus from escaping.
 *
 * @param isActive - Whether the focus trap is currently active
 * @param options - Configuration options
 * @returns A ref to attach to the container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }) {
 *   const containerRef = useFocusTrap(isOpen);
 *   return <div ref={containerRef}>...</div>;
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  options: UseFocusTrapOptions = {}
): RefObject<T | null> {
  const { autoFocus = false } = options;
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element to restore later
    previousActiveElement.current = document.activeElement;

    // Optionally focus the first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      // Shift+Tab on first element -> focus last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, autoFocus]);

  return containerRef;
}

/**
 * Returns all focusable elements within a container.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null // Filter out hidden elements
  );
}
