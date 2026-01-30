'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({
  label,
  error,
  className = '',
  children,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
          error
            ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500/50'
            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        } text-slate-900 dark:text-slate-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
