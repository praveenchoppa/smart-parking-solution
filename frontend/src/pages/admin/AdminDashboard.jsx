import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ParkingSquare,
  Grid,
  CheckCircle2,
  Lock,
  Car,
  BookOpen,
  DollarSign,
  TrendingUp,
  Sparkles,
  QrCode
} from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to load admin metrics.");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Gathering system analytics & occupancy stats..." fullScreen />;
  if (error || !stats) return <ErrorState message={error || "Dashboard data unavailable."} onRetry={fetchStats} />;

  const predictions = stats.ai3Predictions;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Spring Boot Backend Verified Data
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Admin Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time urban parking monitoring, slot allocation, and AI analytics
          </p>
        </div>

        <Button onClick={() => navigate('/admin/scanner')} variant="primary" size="md" icon={QrCode}>
          Open Gate QR Scanner
        </Button>
      </div>

      {/* Metrics Cards Grid (Required by Prompt Rule 23) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Parking Areas"
          value={stats.totalParkingAreas}
          icon={ParkingSquare}
          color="brand"
        />
        <StatCard
          title="Total Slots"
          value={stats.totalSlots}
          icon={Grid}
          color="purple"
        />
        <StatCard
          title="Available Slots"
          value={stats.availableSlots}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied Slots"
          value={stats.occupiedSlots}
          icon={Car}
          color="rose"
        />
        <StatCard
          title="Reserved Slots"
          value={stats.reservedSlots}
          icon={Lock}
          color="amber"
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Completed Sessions"
          value={stats.completedBookings}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* AI-3 Prediction Analytics Summary Banner */}
      {predictions ? (
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 border border-brand-500/30 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-500/20 rounded-2xl border border-brand-400/30 text-brand-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-300 tracking-wider">
                  AI-3 Predictive Analytics Engine
                </span>
                <h3 className="text-lg font-bold text-white">Peak Occupancy Forecast</h3>
                <p className="text-xs text-slate-300">
                  Predicted Peak Time: <strong>{predictions.peakExpectedTime}</strong> • Expected Peak Occupancy:{' '}
                  <strong className="text-amber-400">{predictions.peakExpectedOccupancy}%</strong>
                </p>
              </div>
            </div>

            <Button onClick={() => navigate('/admin/reports')} variant="accent" size="sm">
              View Detailed AI-3 Forecast
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs p-4 rounded-2xl">
          Prediction currently unavailable. Backend AI-3 service is offline.
        </div>
      )}

      {/* Occupancy Breakdown Graph Bar */}
      <ChartCard
        title="Live Overall Occupancy Rate"
        subtitle={`System-wide average: ${stats.overallOccupancyPercentage}% occupied`}
      >
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">System Capacity Utilization</span>
            <span className="text-brand-600 dark:text-brand-400">{stats.overallOccupancyPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-brand-500 via-indigo-500 to-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.overallOccupancyPercentage}%` }}
            />
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
