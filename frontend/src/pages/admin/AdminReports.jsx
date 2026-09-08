import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
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
      const data = await adminApi.getPredictionReports();
      setPredictions(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Prediction currently unavailable.");
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
            Predictive machine learning forecast generated via Spring Boot
          </p>
        </div>

        <Button onClick={fetchPredictions} variant="outline" size="sm" icon={RefreshCw}>
          Recalculate AI Forecast
        </Button>
      </div>

      {error || !predictions ? (
        /* Safe Failure Banner (Prompt Rule 24) */
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs p-6 rounded-3xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Prediction currently unavailable.</h4>
            <p className="mt-1 opacity-90">
              The AI-3 analytics engine is temporarily unready or returning empty forecasts. All other admin dashboard functions remain active.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Key Forecast Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Current Overall Occupancy"
              value={`${predictions.currentOccupancyRate}%`}
              icon={TrendingUp}
              color="brand"
            />
            <StatCard
              title="Peak Expected Time"
              value={predictions.peakExpectedTime}
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Peak Expected Occupancy"
              value={`${predictions.peakExpectedOccupancy}%`}
              icon={Sparkles}
              color="rose"
            />
          </div>

          {/* Forecast Chart */}
          <ChartCard
            title="Hourly Occupancy Prediction Chart"
            subtitle="Calculated probability curve for incoming rush hours"
          >
            <div className="space-y-4 pt-2">
              {predictions.hourlyPredictions?.map((item) => (
                <div key={item.time} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 font-mono">{item.time}</span>
                    <span className={`font-bold ${
                      item.occupancyPercentage >= 85 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.occupancyPercentage}% Occupied
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.occupancyPercentage >= 85 ? 'bg-rose-500' : item.occupancyPercentage >= 75 ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${item.occupancyPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}
