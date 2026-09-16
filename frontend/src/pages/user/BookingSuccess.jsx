import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { bookingApi } from '../../services/api/bookingApi';
import BookingSummary from '../../components/booking/BookingSummary';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      bookingApi.getCurrentBooking().then((data) => {
        setBooking(data);
        setLoading(false);
      }).catch((err) => {
        setLoading(false);
        setError(err.message || "Unable to load booking confirmation.");
      });
      return;
    }

    bookingApi.getBookingDetails(bookingId).then((data) => {
      setBooking(data);
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
      setError(err.message || "Unable to load booking confirmation.");
    });
  }, [bookingId]);

  if (loading) return <LoadingSpinner message="Fetching confirmed booking pass..." fullScreen />;
  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">{error || "No recent booking found."}</p>
        <Link to="/home">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      
      {/* Success Badge Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 text-white">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black">Booking Confirmed!</h1>
        <p className="text-xs text-emerald-100 mt-1">
          Your space is reserved. Show your QR Pass upon arrival.
        </p>

        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-center gap-2 text-xs font-mono">
          <span className="opacity-75">Booking Code:</span>
          <span className="font-extrabold bg-white/20 px-2.5 py-0.5 rounded-lg">
            {booking.bookingCode}
          </span>
        </div>
      </div>

      <BookingSummary
        parkingName={booking.parkingAreaName}
        slotNumber={booking.slotNumber}
        vehicleNumber={booking.vehicleNumber}
        durationHours={booking.durationHours}
        hourlyRate={booking.hourlyRate}
        totalAmount={booking.totalAmount}
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={() => navigate(`/booking/${booking.id}/qr`)}
          variant="primary"
          size="lg"
          icon={QrCode}
          className="flex-1 shadow-lg shadow-brand-600/30"
        >
          View QR Pass
        </Button>
        <Button
          onClick={() => navigate(`/booking/${booking.id}`)}
          variant="outline"
          size="lg"
          icon={FileText}
          className="flex-1"
        >
          View Receipt Details
        </Button>
      </div>
    </div>
  );
}
