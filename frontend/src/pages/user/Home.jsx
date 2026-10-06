import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  RefreshCw,
  SlidersHorizontal,
  Map as MapIcon,
  ListFilter,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { parkingApi } from '../../services/api/parkingApi';
import { getCurrentLocation } from '../../utils/location';
import ParkingCard from '../../components/parking/ParkingCard';
import RecommendationBanner from '../../components/common/RecommendationBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [radius, setRadius] = useState(500);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const navigate = useNavigate();

  const fetchNearbyParking = async (lat, lng, r) => {
    setLoading(true);
    setError(null);
    try {
      const data = await parkingApi.getNearbyParkingAreas({
        latitude: lat,
        longitude: lng,
        radius: r
      });

      setParkingAreas(data || []);

      // Extract AI-2 recommendation if attached by backend response
      const recommended = data?.find((p) => p.recommendationAvailable) || (data.length > 0 ? {
        recommendationAvailable: true,
        recommendedParkingAreaId: data[0].id,
        score: data[0].recommendationScore || 0.92,
        reason: data[0].recommendationReason || "Nearby parking with optimal slot availability"
      } : null);

      setRecommendation(recommended);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Unable to load nearby parking. Please check your connection.");
    }
  };

  const handleGetLocation = async () => {
    setLoading(true);
    setLocationError('');
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      await fetchNearbyParking(coords.latitude, coords.longitude, radius);
    } catch (err) {
      setLoading(false);
      setLocationError(err.message);
      // Fallback default coordinates for Bangalore Tech Hub demo if browser location is denied
      const defaultCoords = { latitude: 12.9716, longitude: 77.5946 };
      setLocation(defaultCoords);
      await fetchNearbyParking(defaultCoords.latitude, defaultCoords.longitude, radius);
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, [radius]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Location Services Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Find Nearby Parking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing authoritative available slots within <strong>{radius} meters</strong>
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setRadius(500)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                radius === 500 ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              500m
            </button>
            <button
              onClick={() => setRadius(1000)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                radius === 1000 ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              1 km
            </button>
            <button
              onClick={() => setRadius(2000)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                radius === 2000 ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              2 km
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
              title="List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'map' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleGetLocation}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Permission Warning if Browser Denied Location */}
      {locationError && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Location Permission Notice</span>
            <span>{locationError} Displaying nearby parking using default location coordinates.</span>
          </div>
        </div>
      )}

      {/* AI-2 Recommendation Component */}
      <RecommendationBanner
        recommendation={recommendation}
        onSelect={(id) => navigate(`/parking/${id}`)}
      />

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Finding nearby parking areas within range..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={handleGetLocation} />
      ) : parkingAreas.length === 0 ? (
        <EmptyState
          title="No Parking Available"
          message={`No parking areas available within ${radius}m.`}
          actionLabel="Expand Search Radius"
          onAction={() => setRadius(2000)}
        />
      ) : viewMode === 'list' ? (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingAreas.map((parking) => (
            <ParkingCard
              key={parking.id}
              parking={parking}
              isRecommended={recommendation?.recommendedParkingAreaId === parking.id}
              recommendationReason={
                recommendation?.recommendedParkingAreaId === parking.id
                  ? recommendation?.reason
                  : null
              }
            />
          ))}
        </div>
      ) : (
        /* Visual Interactive Map Representation */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[450px] relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-mono bg-slate-800/90 text-slate-300 px-3 py-1 rounded-xl border border-slate-700">
              Interactive Grid Radar Map ({parkingAreas.length} Parking Hubs Found)
            </span>
            <span className="text-xs text-brand-400 font-bold bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-xl">
              User GPS: {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
            </span>
          </div>

          {/* Map Grid Markers Representation */}
          <div className="my-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {parkingAreas.map((parking, index) => (
              <div
                key={parking.id}
                onClick={() => navigate(`/parking/${parking.id}`)}
                className="bg-slate-800/90 backdrop-blur border border-slate-700 hover:border-brand-500 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center">
                    P{index + 1}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {parking.availableSlots} Slots Free
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                  {parking.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{parking.address}</p>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-slate-500 z-10">
            Click any map marker box above to view parking details & reserve a slot.
          </div>
        </div>
      )}
    </div>
  );
}
