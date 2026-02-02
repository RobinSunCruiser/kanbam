'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

const baseClasses = 'px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';

const variantClasses = {
  primary: 'bg-linear-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500',
  secondary: 'glass-light text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700/60 focus:ring-slate-400 hover:shadow-lg hover:shadow-slate-500/10',
  danger: 'bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40',
  ghost: 'bg-transparent text-slate-600 hover:text-orange-500 hover:bg-orange-50/50 focus:ring-orange-500/50 dark:text-slate-400 dark:hover:text-orange-400 dark:hover:bg-orange-500/10',
};

export default function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
