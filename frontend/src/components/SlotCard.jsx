import React from 'react';
import { Car, Lock, CheckCircle2 } from 'lucide-react';

export default function SlotCard({ slotId, slotNumber, status, selected, onSelect }) {
  const isAvailable = status === 'AVAILABLE';
  const isOccupied = status === 'OCCUPIED';
  const isReserved = status === 'RESERVED';

  const handleClick = () => {
    if (isAvailable && onSelect) {
      onSelect({ slotId, slotNumber, status });
    }
  };

  let containerStyles = "cursor-pointer border bg-white dark:bg-slate-900 hover:border-brand-500 hover:shadow-md";
  let badgeStyles = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  let statusText = "AVAILABLE";

  if (selected) {
    containerStyles = "border-brand-600 bg-brand-50/80 dark:bg-brand-950/60 ring-2 ring-brand-500 shadow-lg scale-[1.02]";
  } else if (isOccupied) {
    containerStyles = "cursor-not-allowed opacity-65 bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800";
    badgeStyles = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    statusText = "OCCUPIED";
  } else if (isReserved) {
    containerStyles = "cursor-not-allowed opacity-65 bg-amber-500/5 border-amber-200 dark:border-amber-900/40";
    badgeStyles = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    statusText = "RESERVED";
  }

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-between text-center min-h-[110px] ${containerStyles}`}
    >
      {selected && (
        <div className="absolute top-2 right-2 text-brand-600 dark:text-brand-400">
          <CheckCircle2 className="w-5 h-5 fill-brand-600 text-white" />
        </div>
      )}

      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        {isOccupied ? (
          <Car className="w-5 h-5 text-rose-500" />
        ) : isReserved ? (
          <Lock className="w-4 h-4 text-amber-500" />
        ) : (
          <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">P</span>
        )}
      </div>

      <div>
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide font-mono">
          {slotNumber}
        </h4>
        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1 tracking-wider ${badgeStyles}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
