import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function QRCard({ bookingCode, qrData, status, parkingName, slotNumber, vehicleNumber }) {
  const qrString = qrData || bookingCode || 'INVALID-PASS';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl max-w-sm w-full mx-auto text-center relative overflow-hidden">
      
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500" />

      <div className="flex justify-center mb-3">
        <StatusBadge status={status || 'PENDING_CHECK_IN'} />
      </div>

      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
        Digital Parking Pass
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Scan at entry gate for automated check-in
      </p>

      {/* QR Code Container */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 inline-block shadow-inner mb-4">
        <QRCodeSVG
          value={qrString}
          size={180}
          bgColor={"#ffffff"}
          fgColor={"#0f172a"}
          level={"H"}
          includeMargin={false}
        />
      </div>

      {/* Booking Code Display */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl py-2 px-4 mb-5 border border-slate-200 dark:border-slate-700">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">Booking Code</span>
        <span className="text-base font-black font-mono tracking-wider text-brand-600 dark:text-brand-400">
          {bookingCode}
        </span>
      </div>

      {/* Quick Details */}
      <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Lot</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {parkingName || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Slot</span>
          <span className="font-extrabold text-brand-600 dark:text-brand-400 block">
            {slotNumber || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Vehicle</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
            {vehicleNumber || 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Authenticity Verified by Spring Boot Backend</span>
      </div>
    </div>
  );
}
