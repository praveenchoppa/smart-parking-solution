import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Navigation, RefreshCw } from 'lucide-react';
import { bookingApi } from '../../services/api/bookingApi';
import QRCard from '../../components/booking/QRCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function QRBookingPass() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPass = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (id) {
        data = await bookingApi.getBookingConfirmation(id);
      } else {
        data = await bookingApi.getCurrentBooking();
      }
      setBooking(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to load booking pass details.");
    }
  };

  useEffect(() => {
    fetchPass();
  }, [id]);

  if (loading) return <LoadingSpinner message="Generating digital QR pass..." fullScreen />;
  if (error || !booking) return <ErrorState message={error || "No active booking pass found."} onRetry={fetchPass} />;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          to="/current-booking"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Current Pass</span>
        </Link>
        <Button onClick={fetchPass} variant="ghost" size="sm" icon={RefreshCw}>
          Refresh Pass
        </Button>
      </div>

      {/* QR Component */}
      <QRCard
        bookingCode={booking.bookingCode}
        qrData={booking.qrData || booking.bookingCode}
        status={booking.status}
        parkingName={booking.parkingAreaName}
        slotNumber={booking.slotNumber}
        vehicleNumber={booking.vehicleNumber}
      />

      <div className="flex justify-center pt-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.parkingAddress || booking.parkingAreaName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button variant="outline" size="md" icon={Navigation} className="w-full">
            Navigate to Parking Lot
          </Button>
        </a>
      </div>
    </div>
  );
}
