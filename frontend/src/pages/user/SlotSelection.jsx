import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Grid, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parkingApi } from '../../services/api/parkingApi';
import SlotCard from '../../components/parking/SlotCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function SlotSelection() {
  const { id } = useParams();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conflictMsg, setConflictMsg] = useState('');

  const navigate = useNavigate();

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    setConflictMsg('');
    try {
      const data = await parkingApi.getParkingSlots(id);
      setSlots(data?.slots || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to load parking slots.");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [id]);

  const handleSelectSlot = (slot) => {
    if (slot.status === 'AVAILABLE') {
      setSelectedSlot(slot);
      setConflictMsg('');
    }
  };

  const handleProceedToVehicle = () => {
    if (!selectedSlot) return;
    navigate('/vehicles', {
      state: {
        parkingAreaId: Number(id),
        selectedSlot
      }
    });
  };

  if (loading) return <LoadingSpinner message="Loading slot availability layout..." fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchSlots} />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/parking/${id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Parking Overview</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Select a Parking Slot</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI-1 occupancy & backend state: Select any green available slot
          </p>
        </div>

        <Button
          onClick={fetchSlots}
          variant="outline"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
        >
          Refresh Layout
        </Button>
      </div>

      {/* HTTP 409 Slot Conflict Banner */}
      {conflictMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Slot Unavailable (HTTP 409 Conflict)</span>
            <span>{conflictMsg}</span>
          </div>
        </div>
      )}

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300">AVAILABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-700 dark:text-slate-300">RESERVED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-700 dark:text-slate-300">OCCUPIED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-600 ring-2 ring-brand-500/40" />
          <span className="text-brand-600 dark:text-brand-400">SELECTED</span>
        </div>
      </div>

      {/* Slot Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {slots.map((slot) => (
          <SlotCard
            key={slot.slotId}
            slot={slot}
            isSelected={selectedSlot?.slotId === slot.slotId}
            onSelect={handleSelectSlot}
          />
        ))}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 bg-slate-900/95 text-white backdrop-blur border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-600 rounded-xl">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Slot</span>
            <span className="text-base font-extrabold text-white font-mono">
              {selectedSlot ? selectedSlot.slotNumber : 'None Selected'}
            </span>
          </div>
        </div>

        <Button
          onClick={handleProceedToVehicle}
          disabled={!selectedSlot}
          variant="primary"
          size="md"
          icon={CheckCircle2}
        >
          Continue to Vehicle Selection
        </Button>
      </div>
    </div>
  );
}
