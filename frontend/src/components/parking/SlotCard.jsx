import React from 'react';
import { clsx } from 'clsx';
import { Check, Lock, Car } from 'lucide-react';

export default function SlotCard({ slot, isSelected, onSelect }) {
  if (!slot) return null;

  const { slotId, slotNumber, status } = slot;

  const isAvailable = status === 'AVAILABLE';
  const isReserved = status === 'RESERVED';
  const isOccupied = status === 'OCCUPIED';

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => isAvailable && onSelect && onSelect(slot)}
      aria-label={`Slot ${slotNumber}, status ${status}`}
      className={clsx(
        'relative group flex flex-col justify-between p-3 rounded-xl border transition-all duration-150 text-left min-h-[88px] select-none',
        // Available & Selected
        isSelected && isAvailable && 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500 ring-offset-2 shadow-md scale-[1.02]',
        // Available & Unselected
        !isSelected && isAvailable && 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-500 text-slate-900 shadow-sm cursor-pointer',
        // Reserved
        isReserved && 'bg-amber-50/80 border-amber-200 text-amber-800 cursor-not-allowed opacity-80',
        // Occupied
        isOccupied && 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
      )}
    >
      {/* Top Bar: Slot Number & Status Indicator */}
      <div className="flex items-center justify-between w-full">
        <span className={clsx(
          'font-mono font-bold text-sm tracking-tight',
          isSelected && isAvailable ? 'text-white' : 'text-slate-900 dark:text-slate-100'
        )}>
          {slotNumber}
        </span>

        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}

        {!isSelected && isAvailable && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            BAY
          </span>
        )}

        {isReserved && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" />
            HELD
          </span>
        )}

        {isOccupied && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex items-center gap-0.5">
            <Car className="w-3 h-3" />
            PARKED
          </span>
        )}
      </div>

      {/* Visual Parking Bay Marking Line */}
      <div className="w-full mt-2 pt-2 border-t border-dashed border-current/20 flex items-center justify-between text-[10px] font-mono opacity-80">
        <span>{isAvailable ? 'TAP TO PICK' : status}</span>
      </div>
    </button>
  );
}
