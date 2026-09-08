import React from 'react';
import { ShieldCheck, BarChart3 } from 'lucide-react';
import { getOccupancyStatus } from '../utils/formatters';

export default function OccupancyCard({ occupancyData }) {
  if (!occupancyData) return null;

  const {
    totalSlots = 0,
    availableSlots = 0,
    occupiedSlots = 0,
    occupancyPercentage = 0
  } = occupancyData;

  const occupancyInfo = getOccupancyStatus(occupancyPercentage);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-500/10 rounded-xl text-brand-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Occupancy Overview</h3>
            <span className="text-[10px] text-slate-400 font-mono">Future AI-1 Live Feed Ready</span>
          </div>
        </div>

        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${occupancyInfo.color}`}>
          {occupancyPercentage}% ({occupancyInfo.label})
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              occupancyPercentage >= 90 ? 'bg-red-500' : occupancyPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-3 text-center pt-1">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Slots</span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{totalSlots}</span>
        </div>

        <div className="bg-emerald-500/5 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Available</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{availableSlots}</span>
        </div>

        <div className="bg-rose-500/5 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-500/20">
          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Occupied</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{occupiedSlots}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Authoritative data provided by backend</span>
      </div>
    </div>
  );
}
