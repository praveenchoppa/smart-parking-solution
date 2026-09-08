import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, QrCode, Navigation, FileText, CheckCircle2, ParkingSquare, Car } from 'lucide-react';
import { bookingApi } from '../../services/api/bookingApi';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function CurrentBooking() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrent = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getCurrentBooking();
      setBooking(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  if (loading) return <LoadingSpinner message="Checking active booking status..." fullScreen />;

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="No Active Parking Session"
          message="You currently do not have any pending or active check-ins."
          icon={Clock}
          actionLabel="Find & Book Parking"
          onAction={() => navigate('/home')}
        />
      </div>
    );
  }

  const isPendingCheckIn = booking.status === 'PENDING_CHECK_IN';
  const isCheckedIn = booking.status === 'CHECKED_IN';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Status Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={booking.status} />
              <span className="text-xs font-mono text-slate-400">ID #{booking.id}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {isCheckedIn ? 'Session Active (Parked)' : isPendingCheckIn ? 'Upcoming Parking Pass' : 'Completed Session'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Code: <strong className="font-mono text-brand-600 dark:text-brand-400">{booking.bookingCode}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(booking.totalAmount)}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase block">Paid</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Parking Lot Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-600">
              <ParkingSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Parking Lot</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{booking.parkingAreaName}</h4>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 pl-11">{booking.parkingAddress}</p>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Slot Reserved:</span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
              {booking.slotNumber}
            </span>
          </div>
        </div>

        {/* Vehicle & Timing */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-600">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle</span>
              <h4 className="text-base font-bold font-mono text-slate-900 dark:text-white">{booking.vehicleNumber}</h4>
            </div>
          </div>

          <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Booked On:</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{formatDateTime(booking.createdAt)}</span>
            </div>
            {booking.checkInTime && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Check-In Time:</span>
                <span>{formatDateTime(booking.checkInTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isPendingCheckIn && (
          <>
            <Button
              onClick={() => navigate(`/booking/${booking.id}/qr`)}
              variant="primary"
              size="lg"
              icon={QrCode}
              className="flex-1 shadow-lg shadow-brand-600/30"
            >
              Show Entry QR Pass
            </Button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.parkingAddress || booking.parkingAreaName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="lg" icon={Navigation} className="w-full">
                Get Directions
              </Button>
            </a>
          </>
        )}

        {(isCheckedIn || isCompleted) && (
          <Button
            onClick={() => navigate(`/booking/${booking.id}`)}
            variant="primary"
            size="lg"
            icon={FileText}
            className="w-full shadow-lg shadow-brand-600/30"
          >
            View Full Receipt & Details
          </Button>
        )}
      </div>
    </div>
  );
}
