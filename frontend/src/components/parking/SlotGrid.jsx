import React from 'react';
import SlotCard from './SlotCard';
import { RefreshCw, Info, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

export default function SlotGrid({
  slots = [],
  selectedSlotId,
  onSelectSlot,
  onRefresh,
  isRefreshing = false,
  conflictError = null
}) {
  // Split slots into Left Row & Right Row to simulate real parking garage aisle / driving lane
  const half = Math.ceil(slots.length / 2);
  const leftRow = slots.slice(0, half);
  const rightRow = slots.slice(half);

  return (
    <div className="space-y-6">
      
      {/* 409 Conflict Alert Banner if slot was taken concurrently */}
      {conflictError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3 text-rose-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Slot Reservation Conflict (409)</h4>
              <p className="text-xs text-rose-700 mt-0.5">{conflictError}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} isLoading={isRefreshing} icon={RefreshCw}>
            Refresh Slots
          </Button>
        </div>
      )}

      {/* Grid Legend & Live Refresh Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-emerald-500 shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-slate-700 dark:text-slate-300">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
            <span className="text-slate-700 dark:text-slate-300">Occupied</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Live Refresh</span>
        </button>
      </div>

      {/* Theatre Style Parking Bay Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Top Parking Row (North Bays) */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider font-semibold">
            North Bay Section (Aisles 01 - {leftRow.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {leftRow.map((slot) => (
              <SlotCard
                key={slot.slotId}
                slot={slot}
                isSelected={selectedSlotId === slot.slotId}
                onSelect={onSelectSlot}
              />
            ))}
          </div>
        </div>

        {/* Driving Lane / Aisle Indicator */}
        <div className="driving-lane-pattern py-3 px-4 rounded-xl border border-slate-700/60 flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>⬆ ENTRY / DRIVING LANE</span>
          <span className="text-[10px] tracking-widest uppercase">SLOW 5 KM/H</span>
          <span>EXIT ⬇</span>
        </div>

        {/* Bottom Parking Row (South Bays) */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider font-semibold">
            South Bay Section (Aisles {leftRow.length + 1} - {slots.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {rightRow.map((slot) => (
              <SlotCard
                key={slot.slotId}
                slot={slot}
                isSelected={selectedSlotId === slot.slotId}
                onSelect={onSelectSlot}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
