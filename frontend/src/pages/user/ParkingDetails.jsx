import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Sparkles,
  ArrowLeft,
  Grid,
  ShieldCheck
} from 'lucide-react';
import { parkingApi } from '../../services/api/parkingApi';
import { formatCurrency, formatDistance, getOccupancyStatus } from '../../utils/formatters';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function ParkingDetails() {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parkingApi.getParkingDetails(id);
      setParking(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to load parking details.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Fetching parking area details..." fullScreen />;
  if (error || !parking) return <ErrorState message={error || "Parking area not found."} onRetry={fetchDetails} />;

  const occupancyInfo = getOccupancyStatus(parking.occupancyPercentage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Nearby Parking</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${occupancyInfo.color}`}>
                {parking.occupancyPercentage}% Occupied
              </span>
              <span className="text-xs text-slate-400 font-mono">• Authoritative AI-1 Sync</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{parking.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{parking.address}</span>
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>GPS Coordinates: {parking.latitude}, {parking.longitude}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
              {formatCurrency(parking.hourlyRate)}
            </span>
            <span className="text-xs text-slate-500 block">/ hour rate</span>
          </div>
        </div>

        {/* AI-2 Recommendation Banner if applicable */}
        {parking.recommendationAvailable && (
          <div className="mt-6 bg-gradient-to-r from-brand-900 to-indigo-950 text-white rounded-2xl p-4 flex items-start gap-3 border border-brand-500/30">
            <Sparkles className="w-6 h-6 text-brand-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-brand-300 uppercase tracking-wider">AI-2 Recommended Lot</div>
              <p className="text-xs text-brand-100 mt-0.5">
                {parking.recommendationReason || "High availability and lowest congestion index."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Distance"
          value={formatDistance(parking.distance)}
          color="brand"
        />
        <StatCard
          title="Total Slots"
          value={parking.totalSlots}
          color="purple"
        />
        <StatCard
          title="Available"
          value={parking.availableSlots}
          color="emerald"
        />
        <StatCard
          title="Occupied"
          value={parking.occupiedSlots || Math.max(0, parking.totalSlots - parking.availableSlots)}
          color="amber"
        />
      </div>

      {/* Action Buttons & Features */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Real-time slot occupancy updated directly from Spring Boot backend.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${parking.latitude},${parking.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <Button variant="outline" size="md" icon={Navigation} className="w-full">
              Get Directions
            </Button>
          </a>
          <Button
            onClick={() => navigate(`/parking/${id}/slots`)}
            variant="primary"
            size="md"
            icon={Grid}
            className="flex-1 sm:flex-none"
          >
            View Available Slots
          </Button>
        </div>
      </Card>
    </div>
  );
}
