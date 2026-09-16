import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { parkingApi } from '../../services/api/parkingApi';
import { bookingApi } from '../../services/api/bookingApi';
import BookingSummary from '../../components/booking/BookingSummary';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const { parkingAreaId, selectedSlot, selectedVehicle } = stateData;

  const [parking, setParking] = useState(null);
  const [durationHours, setDurationHours] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!parkingAreaId || !selectedSlot || !selectedVehicle) {
      navigate('/home', { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        const pData = await parkingApi.getParkingDetails(parkingAreaId);
        setParking(pData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.message || "Unable to retrieve parking details.");
      }
    };

    loadData();
  }, [parkingAreaId, selectedSlot, selectedVehicle, navigate]);

  const calculatedAuthoritativeAmount = parking ? parking.hourlyRate * durationHours : 0;

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const response = await bookingApi.createBooking({
        parkingAreaId: Number(parkingAreaId),
        parkingSlotId: selectedSlot.slotId ?? selectedSlot.id,
        vehicleId: selectedVehicle.id,
        durationHours: Number(durationHours)
      });

      // Navigate to payment page with newly created backend booking object
      navigate('/payment', {
        state: { booking: response }
      });
    } catch (err) {
      setSubmitting(false);
      const msg = err.response?.data?.message || err.message || "Failed to create booking reservation.";
      setErrorMsg(msg);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating authoritative rate & reservation summary..." fullScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <Link
        to={`/parking/${parkingAreaId}/slots`}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Slot Selection</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Confirm Booking</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review your reservation details before proceeding to payment
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-xs p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Reservation Error</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Duration Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <Select
          label="Select Parking Duration"
          icon={Clock}
          value={durationHours}
          onChange={(e) => setDurationHours(Number(e.target.value))}
          options={[
            { value: 1, label: '1 Hour' },
            { value: 2, label: '2 Hours' },
            { value: 3, label: '3 Hours' },
            { value: 4, label: '4 Hours' },
            { value: 8, label: 'Full Day (8 Hours)' }
          ]}
        />
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Amount calculation is enforced by Spring Boot backend.</span>
        </p>
      </div>

      {/* Summary Component */}
      <BookingSummary
        parkingName={parking?.name}
        slotNumber={selectedSlot?.slotNumber}
        vehicleNumber={selectedVehicle?.vehicleNumber}
        durationHours={durationHours}
        hourlyRate={parking?.hourlyRate}
        totalAmount={calculatedAuthoritativeAmount}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          onClick={handleConfirmBooking}
          isLoading={submitting}
          variant="primary"
          size="lg"
          icon={CreditCard}
          className="w-full shadow-xl shadow-brand-600/30 py-4 text-base"
        >
          Confirm Reservation & Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
