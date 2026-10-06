import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getPredictionReports();
      setData(result);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Unable to load AI-3 Occupancy Prediction Analytics.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Loading AI-3 Occupancy Prediction models..." fullScreen />;
  if (error || !data) return <ErrorState message={error || "Failed to load reports."} onRetry={fetchReports} />;

  const chartData = data.hourlyPredictions || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg mb-1 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI-3 Occupancy Forecast Engine Active</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Occupancy & Predictive Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Machine learning time-series forecasts for peak parking congestion and capacity planning
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Current System Occupancy"
          value={`${data.currentOccupancyRate}%`}
          color="emerald"
        />

        <StatCard
          title="Peak Expected Time"
          value={data.peakExpectedTime}
          color="amber"
        />

        <StatCard
          title="Peak Forecast Occupancy"
          value={`${data.peakExpectedOccupancy}%`}
          color="rose"
        />
      </div>

      {/* Peak Warning Callout */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider">AI-3 Congestion Advisory</h4>
          <p className="text-xs mt-0.5 text-amber-800 dark:text-amber-300">
            System predicts peak congestion at <strong>{data.peakExpectedTime}</strong> reaching <strong>{data.peakExpectedOccupancy}% capacity</strong>. Ensure entry security scanners are pre-staffed.
          </p>
        </div>
      </div>

      {/* AI-3 Recharts Occupancy Curve */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hourly Occupancy Prediction Curve</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Forecasted occupancy percentage over the next 7 hours</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Time-Series Regression Model</span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
                formatter={(value) => [`${value}% Occupancy`, 'Predicted']}
              />
              <Area
                type="monotone"
                dataKey="occupancyPercentage"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#occupancyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
