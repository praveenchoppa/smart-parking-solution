import React from 'react';
import { clsx } from 'clsx';

const STATUS_CONFIGS = {
  // SlotStatus
  AVAILABLE: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40' },
  RESERVED: { label: 'Reserved', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40' },
  OCCUPIED: { label: 'Occupied', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40' },

  // BookingStatus
  PENDING_PAYMENT: { label: 'Pending Payment', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDING_CHECK_IN: { label: 'Pending Check-In', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300' },
  CHECKED_IN: { label: 'Checked In', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },

  // PaymentStatus
  PENDING: { label: 'Payment Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  SUCCESS: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Payment Failed', className: 'bg-rose-50 text-rose-700 border-rose-200' },

  // Roles
  ADMIN: { label: 'System Admin', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300' },
  USER: { label: 'Registered Driver', className: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export default function StatusBadge({ status, customLabel, size = 'sm', className = '' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    className: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium',
    sm: 'text-xs px-2.5 py-0.5 rounded-md font-mono font-medium',
    md: 'text-xs px-3 py-1 rounded-lg font-mono font-semibold'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{customLabel || config.label}</span>
    </span>
  );
}
