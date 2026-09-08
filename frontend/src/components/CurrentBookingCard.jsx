import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, QrCode, FileText, ParkingSquare, Car } from 'lucide-react';
import StatusBadge from './common/StatusBadge';
import Button from './common/Button';
import { formatCurrency } from '../utils/formatters';

export default function CurrentBookingCard({ booking }) {
  const navigate = useNavigate();

  if (!booking) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 w-12 h-12 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Active Booking Session</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">You do not have any pending or active check-ins at this moment.</p>
        <Link to="/dashboard">
          <Button variant="primary" size="sm">Find & Book Parking</Button>
        </Link>
      </div>
    );
  }

  const {
    id,
    bookingCode,
    parkingAreaName,
    slotNumber,
    vehicleNumber,
    totalAmount,
    status
  } = booking;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Active Reservation</span>
          <h3 className="text-lg font-black font-mono text-brand-600 dark:text-brand-400">{bookingCode}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <ParkingSquare className="w-5 h-5 text-brand-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Parking Lot</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{parkingAreaName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="w-5 h-5 rounded-lg bg-brand-500/10 text-brand-600 font-extrabold flex items-center justify-center text-xs shrink-0">P</span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Slot Allocated</span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400">{slotNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Car className="w-5 h-5 text-brand-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Vehicle Plate</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">{vehicleNumber}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <span className="text-xs text-slate-500">
          Total Paid: <strong>{formatCurrency(totalAmount)}</strong>
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {status === 'PENDING_CHECK_IN' && (
            <Button
              onClick={() => navigate(`/booking/${id}/qr`)}
              variant="primary"
              size="sm"
              icon={QrCode}
              className="flex-1 sm:flex-none"
            >
              Show Entry QR Pass
            </Button>
          )}

          <Button
            onClick={() => navigate(`/booking/${id}`)}
            variant="outline"
            size="sm"
            icon={FileText}
            className="flex-1 sm:flex-none"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
