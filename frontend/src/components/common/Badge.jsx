import React from 'react';
import { clsx } from 'clsx';

export default function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary: 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded',
    sm: 'text-xs px-2.5 py-0.5 rounded-md font-medium',
    md: 'text-xs px-3 py-1 rounded-lg font-semibold'
  };

  return (
    <span className={clsx('inline-flex items-center font-mono border', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
