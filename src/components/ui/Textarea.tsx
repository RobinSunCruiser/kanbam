'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y ${
          error
            ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500/50'
            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        } text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
