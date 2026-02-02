'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'seamless';
  autoResize?: boolean;
  maxRows?: number;
}

export default function Textarea({
  label,
  error,
  variant = 'default',
  autoResize = false,
  maxRows = 10,
  className = '',
  onChange,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate line height from computed styles
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

    // Calculate max height based on maxRows
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

    // Set height to scrollHeight, capped at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [autoResize, maxRows]);

  // Adjust height on mount and when value changes
  useEffect(() => {
    adjustHeight();
  }, [props.value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    adjustHeight();
  };

  const baseStyles = 'w-full rounded-xl transition-all duration-300 ease-out focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';

  const variantStyles = {
    default: `px-4 py-3 focus:ring-2 focus:ring-orange-500/50 border ${
      error
        ? 'bg-red-50/80 dark:bg-red-900/20 ring-2 ring-red-500/50 border-red-300 dark:border-red-700'
        : 'glass-light hover:bg-white/70 dark:hover:bg-slate-700/60 focus:bg-white/80 dark:focus:bg-slate-700/70 border-transparent focus:border-orange-500/30'
    } shadow-sm focus:shadow-md focus:shadow-orange-500/10`,
    seamless: 'px-0 py-1 bg-transparent border-none focus:ring-0',
  };

  const resizeClass = autoResize ? 'resize-none overflow-auto' : 'resize-y';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        className={`${baseStyles} ${variantStyles[variant]} ${resizeClass} ${className}`}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
