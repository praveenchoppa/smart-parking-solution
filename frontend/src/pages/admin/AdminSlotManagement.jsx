import React, { useState, useEffect } from 'react';
import { Grid, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminSlotManagement() {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedParkingId, setSelectedParkingId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getParkingAreas().then((data) => {
      setParkingAreas(data || []);
      if (data && data.length > 0) {
        setSelectedParkingId(data[0].id);
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedParkingId) {
      fetchSlots(selectedParkingId);
    }
  }, [selectedParkingId]);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Parking Slot Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect live slot states across individual parking lots
          </p>
        </div>

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
      </div>

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
