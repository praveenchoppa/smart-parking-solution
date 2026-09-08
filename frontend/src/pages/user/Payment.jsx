import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';
import { paymentApi } from '../../services/api/paymentApi';
import BookingSummary from '../../components/booking/BookingSummary';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const booking = location.state?.booking;

  const [paymentState, setPaymentState] = useState('IDLE'); // 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'
  const [errorMsg, setErrorMsg] = useState('');

  if (!booking) {
    navigate('/home', { replace: true });
    return null;
  }

  const handlePayNow = async () => {
    setPaymentState('PROCESSING');
    setErrorMsg('');
    try {
      const response = await paymentApi.processPayment(booking.id, {
        method: "SIMULATED_CARD"
      });

      if (response.success) {
        setPaymentState('SUCCESS');
        setTimeout(() => {
          navigate('/booking/success', {
            state: { bookingId: booking.id }
          });
        }, 1200);
      } else {
        setPaymentState('FAILURE');
        setErrorMsg(response.message || "Payment simulation declined.");
      }
    } catch (err) {
      setPaymentState('FAILURE');
      setErrorMsg(err.message || "Payment gateway processing error.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Simulated Payment Gateway</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete payment to transition booking status to <strong>PENDING_CHECK_IN</strong>
        </p>
      </div>

      {paymentState === 'FAILURE' && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-xs p-4 rounded-2xl flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Payment Failed</span>
            <span>{errorMsg || "Transaction failed. You may retry payment."}</span>
          </div>
        </div>
      )}

      {paymentState === 'SUCCESS' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs p-4 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <span className="font-bold block">Payment Successful!</span>
            <span>Redirecting to your digital booking pass...</span>
          </div>
        </div>
      )}

      <BookingSummary
        parkingName={booking.parkingAreaName}
        slotNumber={booking.slotNumber}
        vehicleNumber={booking.vehicleNumber}
        durationHours={booking.durationHours}
        hourlyRate={booking.hourlyRate}
        totalAmount={booking.totalAmount}
      />

      <div className="space-y-3 pt-2">
        <Button
          onClick={handlePayNow}
          isLoading={paymentState === 'PROCESSING'}
          disabled={paymentState === 'SUCCESS'}
          variant="accent"
          size="lg"
          icon={CreditCard}
          className="w-full shadow-xl shadow-emerald-600/30 py-4 text-base"
        >
          {paymentState === 'PROCESSING' ? 'Processing Payment...' : paymentState === 'FAILURE' ? 'Retry Payment' : 'Pay Now'}
        </Button>

        <Button
          onClick={() => navigate('/home')}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          Cancel & Return Home
        </Button>
      </div>
    </div>
  );
}
