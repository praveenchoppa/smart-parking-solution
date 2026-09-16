import React, { useState } from 'react';
import { QrCode, Camera, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AdminQRScanner() {
  const [inputCode, setInputCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setSubmitting(true);
    setScanResult(null);
    try {
      // POST /api/check-in -> Returns authoritative result from Spring Boot backend
      const result = await adminApi.processCheckIn(inputCode.trim());
      setScanResult(result);
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setScanResult({
        status: "INVALID",
        message: err.message || "Failed to verify check-in code with backend."
      });
    }
  };

  const getResultBadge = (status) => {
    switch (status) {
      case 'VALID':
        return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2, title: 'VALID CHECK-IN (ACCESS GRANTED)' };
      case 'ALREADY_CHECKED_IN':
        return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300', icon: AlertTriangle, title: 'ALREADY CHECKED IN' };
      case 'COMPLETED':
        return { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300', icon: AlertTriangle, title: 'SESSION COMPLETED' };
      case 'UNPAID':
        return { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300', icon: XCircle, title: 'UNPAID RESERVATION' };
      default:
        return { bg: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300', icon: XCircle, title: 'INVALID / NOT FOUND' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center">
        <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-600/30">
          <Camera className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gate Security QR Scanner</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scan user digital pass or enter booking code to process Spring Boot check-in
        </p>
      </div>

      {/* Code Input Form / Scanner simulation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <Input
            label="Scan / Enter Booking Code"
            icon={QrCode}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter the booking code from the user pass"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            icon={ArrowRight}
            className="w-full shadow-lg shadow-brand-600/30"
          >
            Verify Pass with Spring Boot Backend
          </Button>
        </form>
      </div>

      {/* Authoritative Backend Result Display */}
      {scanResult && (() => {
        const badge = getResultBadge(scanResult.status);
        const Icon = badge.icon;
        return (
          <div className={`border rounded-3xl p-6 space-y-4 animate-in fade-in ${badge.bg}`}>
            <div className="flex items-center gap-3">
              <Icon className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-black">{badge.title}</h3>
                <p className="text-xs opacity-90">{scanResult.message}</p>
              </div>
            </div>

            {scanResult.bookingCode && (
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-current/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-70">Booking Code:</span>
                  <span className="font-mono font-bold">{scanResult.bookingCode}</span>
                </div>
                {scanResult.parkingAreaName && (
                  <div className="flex justify-between">
                    <span className="opacity-70">Parking Lot:</span>
                    <span className="font-bold">{scanResult.parkingAreaName}</span>
                  </div>
                )}
                {scanResult.slotNumber && (
                  <div className="flex justify-between">
                    <span className="opacity-70">Slot Allocated:</span>
                    <span className="font-extrabold">{scanResult.slotNumber}</span>
                  </div>
                )}
                {scanResult.vehicleNumber && (
                  <div className="flex justify-between">
                    <span className="opacity-70">Vehicle:</span>
                    <span className="font-mono font-bold">{scanResult.vehicleNumber}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] opacity-70 font-semibold pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Result verified by Spring Boot check-in service</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
