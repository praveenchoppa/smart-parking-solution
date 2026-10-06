import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Car, AlertTriangle, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminReports() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const areas = await adminApi.getParkingAreas();
      const parkingAreaId = areas?.[0]?.id ?? 1;
      const data = await adminApi.getPredictionReports(parkingAreaId);
      setPredictions(data);
    } catch (err) {
      setError(err.message || 'Prediction currently unavailable.');
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  if (loading) return <LoadingSpinner message="Querying AI-3 occupancy predictive models..." fullScreen />;

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              AI-3 Intelligence Analytics
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Occupancy & AI-3 Predictions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Next-hour occupancy forecast from the AI-3 model via Spring Boot
          </p>
        </div>

        <Button onClick={fetchPredictions} variant="outline" size="sm" icon={RefreshCw}>
          Recalculate AI Forecast
        </Button>
      </div>

      {error || !predictions ? (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs p-6 rounded-3xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Prediction currently unavailable.</h4>
            <p className="mt-1 opacity-90">
              Ensure AI-3 is running on port 5002 and Spring Boot can reach it at /api/ai/ai3/parking-areas/&#123;id&#125;/predict.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Predicted Occupancy (Next Hour)"
              value={`${predictions.predictedOccupancyRate}%`}
              icon={TrendingUp}
              color="brand"
            />
            <StatCard
              title="Predicted Occupied Slots"
              value={predictions.predictedOccupiedSlots}
              icon={Car}
              color="amber"
            />
            <StatCard
              title="Predicted Available Slots"
              value={predictions.availableSlots}
              icon={Sparkles}
              color="emerald"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs text-slate-500 dark:text-slate-400">
            Forecast for parking area #{predictions.parkingAreaId}. Values are returned directly from the AI-3 model
            (previous occupancy is estimated by Spring Boot from current slot statuses).
          </div>
        </>
      )}
    </div>
  );
}
