import React from 'react';
import { ParkingSquare, Grid, Car, Clock, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

export default function BookingSummary({
  parkingName,
  slotNumber,
  vehicleNumber,
  durationHours,
  hourlyRate,
  totalAmount
}) {
  return (
    <Card className="border-brand-500/30 bg-gradient-to-br from-white via-slate-50 to-brand-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/20">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Booking Summary
        </h3>
        <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Backend Verified</span>
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ParkingSquare className="w-4 h-4 text-brand-500" />
            <span>Parking Area</span>
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{parkingName || 'N/A'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Grid className="w-4 h-4 text-brand-500" />
            <span>Slot Number</span>
          </span>
          <span className="font-extrabold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
            {slotNumber || 'N/A'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Car className="w-4 h-4 text-brand-500" />
            <span>Vehicle</span>
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{vehicleNumber || 'N/A'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Duration</span>
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{durationHours} Hour(s)</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Rate / Hour</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(hourlyRate)}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
        <div>
          <span className="text-xs uppercase font-extrabold text-slate-400 block">Total Amount</span>
          <span className="text-[10px] text-slate-500">Calculated by Backend</span>
        </div>
        <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </Card>
  );
}
