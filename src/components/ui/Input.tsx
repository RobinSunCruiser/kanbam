'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500/50 border ${
          error
            ? 'bg-red-50/80 dark:bg-red-900/20 ring-2 ring-red-500/50 border-red-300 dark:border-red-700'
            : 'glass-light hover:bg-white/70 dark:hover:bg-slate-700/60 focus:bg-white/80 dark:focus:bg-slate-700/70 border-transparent focus:border-orange-500/30'
        } text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:shadow-md focus:shadow-orange-500/10 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
