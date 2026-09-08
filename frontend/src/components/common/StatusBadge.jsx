import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  const badgeConfig = {
    AVAILABLE: { label: 'AVAILABLE', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    RESERVED: { label: 'RESERVED', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    OCCUPIED: { label: 'OCCUPIED', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    PENDING_PAYMENT: { label: 'PENDING PAYMENT', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    PENDING_CHECK_IN: { label: 'PENDING CHECK-IN', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    CHECKED_IN: { label: 'CHECKED IN', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    COMPLETED: { label: 'COMPLETED', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
    CANCELLED: { label: 'CANCELLED', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    PAID: { label: 'PAID', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    UNPAID: { label: 'UNPAID', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  };

  const config = badgeConfig[normalized] || {
    label: normalized || 'UNKNOWN',
    bg: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  );
}
