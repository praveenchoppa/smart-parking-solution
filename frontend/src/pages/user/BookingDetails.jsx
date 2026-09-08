import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, ParkingSquare, Car, Clock } from 'lucide-react';
import { bookingApi } from '../../services/api/bookingApi';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingDetails(id);
      setBooking(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Unable to load booking details.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Fetching receipt statement..." fullScreen />;
  if (error || !booking) return <ErrorState message={error || "Booking not found."} onRetry={fetchDetails} />;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>

        <Button onClick={handlePrint} variant="outline" size="sm" icon={Printer}>
          Print Receipt
        </Button>
      </div>

      {/* Clean Digital Receipt Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Receipt Header */}
        <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
            <ParkingSquare className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">PARKSmart Official Receipt</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Smart Urban Parking Solution • Receipt #{booking.id}
          </p>

          <div className="mt-4 flex justify-center">
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Key Values */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Booking Code:</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{booking.bookingCode}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Parking Facility:</span>
            <span className="font-bold text-slate-900 dark:text-white">{booking.parkingAreaName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Reserved Slot:</span>
            <span className="font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {booking.slotNumber}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Vehicle Registered:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{booking.vehicleNumber}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Duration:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{booking.durationHours} Hour(s)</span>
          </div>

          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Hourly Rate:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(booking.hourlyRate)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Created Timestamp:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDateTime(booking.createdAt)}</span>
          </div>

          {booking.checkInTime && (
            <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
              <span>Gate Check-In:</span>
              <span className="font-semibold">{formatDateTime(booking.checkInTime)}</span>
            </div>
          )}

          {booking.completedTime && (
            <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800 text-slate-500">
              <span>Gate Exit Completion:</span>
              <span className="font-semibold">{formatDateTime(booking.completedTime)}</span>
            </div>
          )}
        </div>

        {/* Total Price Box */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Payment Complete</span>
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(booking.totalAmount)}
          </span>
        </div>

        <div className="text-center pt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Backend Verification Code: {booking.bookingCode}</span>
        </div>
      </div>
    </div>
  );
}
