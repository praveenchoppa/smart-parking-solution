import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock, Car, ShieldCheck, Download, Printer } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function QRCard({ booking, showActions = true }) {
  if (!booking) return null;

  const {
    bookingCode,
    parkingAreaName,
    parkingAddress,
    slotNumber,
    vehicleNumber,
    vehicleType,
    durationHours,
    hourlyRate,
    totalAmount,
    status,
    createdAt
  } = booking;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-none">
      
      {/* Boarding Pass Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
            OFFICIAL GATE PARKING PASS
          </span>
          <h3 className="text-lg font-black tracking-tight mt-0.5">{parkingAreaName}</h3>
        </div>

        <StatusBadge status={status} size="sm" />
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 space-y-6">
        
        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="bg-white p-3 rounded-lg shadow-inner border border-slate-200">
            <QRCodeSVG
              value={bookingCode}
              size={170}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Booking Code Monospace */}
          <div className="mt-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">BOOKING REFERENCE CODE</span>
            <span className="text-base font-mono font-black text-slate-900 dark:text-slate-100 tracking-wider">
              {bookingCode}
            </span>
          </div>
        </div>

        {/* Ticket Perforation Line */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
          <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] font-mono text-slate-400 uppercase">
            DETACHABLE GATE SCANNER COUPON
          </span>
        </div>

        {/* Ticket Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">ASSIGNED BAY</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              BAY {slotNumber}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">VEHICLE PLATE</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
              {vehicleNumber} ({vehicleType || 'CAR'})
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">RESERVATION DURATION</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {durationHours} HOUR(S)
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">TOTAL AUTHORIZED</span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Footer Instructions */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Present this QR code to gate security at entry scanner or supply code <strong>{bookingCode}</strong>.</span>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline" size="sm" icon={Printer} className="w-full">
            Print / Save Pass
          </Button>
        </div>
      )}
    </div>
  );
}
