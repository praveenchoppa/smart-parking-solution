import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import { mapSlot } from '../../services/api/parkingApi';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AI1_DEMO_PARKING_AREA_ID = '1';

export default function AdminSlotManagement() {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedParkingId, setSelectedParkingId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    adminApi.getParkingAreas().then((data) => {
      setParkingAreas(data || []);
      if (data && data.length > 0) {
        setSelectedParkingId(String(data[0].id));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchSlots = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminApi.getSlots(id);
      setSlots(data || []);
    } catch (err) {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedParkingId) {
      setSyncResult(null);
      setSyncError(null);
      fetchSlots(selectedParkingId);
    }
  }, [selectedParkingId]);

  const handleSyncAi1Occupancy = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const result = await adminApi.syncAi1Occupancy(selectedParkingId);
      setSyncResult(result);
      if (result.slots && result.slots.length > 0) {
        setSlots(result.slots.map(mapSlot));
      } else {
        await fetchSlots(selectedParkingId);
      }
    } catch (err) {
      setSyncError(err.message || 'AI-1 sync failed. Ensure AI-1 is running on port 5000.');
    } finally {
      setSyncing(false);
    }
  };

  const isAi1DemoArea = selectedParkingId === AI1_DEMO_PARKING_AREA_ID;

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Parking Slot Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect live slot states across individual parking lots
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={selectedParkingId}
            onChange={(e) => setSelectedParkingId(e.target.value)}
            className="py-2.5 px-4 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500"
          >
            {parkingAreas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.totalSlots} Slots)
              </option>
            ))}
          </select>

          {isAi1DemoArea && (
            <Button
              onClick={handleSyncAi1Occupancy}
              disabled={syncing || loading}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing AI-1...' : 'Sync AI-1 Occupancy'}
            </Button>
          )}
        </div>
      </div>

      {syncError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {syncError}
        </div>
      )}

      {syncResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            AI-1 sync completed for parking area #{syncResult.parkingAreaId}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-emerald-900 dark:text-emerald-100">
            <div>
              <span className="block text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Updated</span>
              <span className="text-lg font-black">{syncResult.updatedSlots}</span>
            </div>
            <div>
              <span className="block text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Unchanged</span>
              <span className="text-lg font-black">{syncResult.unchangedSlots}</span>
            </div>
            <div>
              <span className="block text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Unmatched AI</span>
              <span className="text-lg font-black">{syncResult.unmatchedAiSlots}</span>
            </div>
            <div>
              <span className="block text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">AI Detections</span>
              <span className="text-lg font-black">{syncResult.totalAiDetections}</span>
            </div>
          </div>
          {syncResult.unmatchedAiSlotNumbers && syncResult.unmatchedAiSlotNumbers.length > 0 && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Unmatched AI slot numbers: {syncResult.unmatchedAiSlotNumbers.join(', ')}
            </p>
          )}
          {syncResult.unmatchedAiSlots === 0 && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              All AI-1 slots mapped successfully (A01-A69).
            </p>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching slot configurations..." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.slotId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-sm"
            >
              <span className="text-[10px] text-slate-400 font-mono block">ID #{slot.slotId}</span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{slot.slotNumber}</h4>
              <StatusBadge status={slot.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
