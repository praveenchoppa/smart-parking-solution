import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, Keyboard, CheckCircle, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminQRScanner() {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let scanner = null;
    if (activeTab === 'camera') {
      scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 220, height: 220 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleVerifyCode(decodedText);
          scanner.clear();
        },
        (error) => {
          // Silent camera frame scan error
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [activeTab]);

  const handleVerifyCode = async (codeToVerify) => {
    const code = (codeToVerify || manualCode).trim();
    if (!code) return;

    setVerifying(true);
    setResult(null);

    try {
      const response = await adminApi.processCheckIn(code);
      setResult(response);
      setVerifying(false);
    } catch (err) {
      setVerifying(false);
      setResult({
        status: 'FAILED',
        message: err.message || 'Gate verification failed.'
      });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVerifyCode(manualCode);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gate Security QR Scanner</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Verify driver check-in passes at the parking entry gate via camera scan or manual code input
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
            activeTab === 'camera'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Manual Booking Code</span>
        </button>
      </div>

      {/* Main Scanner Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        
        {activeTab === 'camera' ? (
          <div className="space-y-4">
            <div id="qr-reader-container" className="overflow-hidden rounded-xl border border-slate-200" />
            <p className="text-center text-xs text-slate-400 font-mono">
              Position the driver's QR pass in front of the camera to verify entry
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              label="Enter 10-Character Booking Code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. BK101-A1F9"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={verifying}
              disabled={verifying || !manualCode.trim()}
            >
              Verify Gate Check-In
            </Button>
          </form>
        )}
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className={`border rounded-2xl p-6 shadow-lg transition-all ${
          result.status === 'VALID'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100'
            : result.status === 'ALREADY_CHECKED_IN'
            ? 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100'
            : 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100'
        }`}>
          <div className="flex items-start gap-4">
            {result.status === 'VALID' ? (
              <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
            ) : result.status === 'ALREADY_CHECKED_IN' ? (
              <AlertCircle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-1" />
            )}

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight">{result.status} GATE VERIFICATION</h3>
                <StatusBadge status={result.status === 'VALID' ? 'CHECKED_IN' : result.status} />
              </div>

              <p className="text-xs font-medium opacity-90">{result.message}</p>

              {result.bookingCode && (
                <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-current/15 text-xs font-mono">
                  <div>
                    <span className="opacity-60 block text-[10px]">BOOKING CODE</span>
                    <span className="font-bold">{result.bookingCode}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">ASSIGNED BAY</span>
                    <span className="font-bold">{result.slotNumber}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">VEHICLE PLATE</span>
                    <span className="font-bold">{result.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">PARKING LOCATION</span>
                    <span className="font-bold">{result.parkingAreaName}</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => {
                    setResult(null);
                    setManualCode('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Scan Next Driver Pass
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
