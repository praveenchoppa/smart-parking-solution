import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { parkingApi } from '../../services/api/parkingApi';
import { bookingApi } from '../../services/api/bookingApi';
import { recommendApi } from '../../services/api/recommendApi';
import { DEMO_SEARCH_CENTER, NEARBY_SEARCH_RADIUS_METERS } from '../../constants/demoLocation';

import MapView from '../../components/MapView';
import ParkingCard from '../../components/ParkingCard';
import OccupancyCard from '../../components/OccupancyCard';
import RecommendationCard from '../../components/RecommendationCard';
import CurrentBookingCard from '../../components/CurrentBookingCard';
import QuickAction from '../../components/QuickAction';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

export default function Dashboard() {
  const { user } = useAuth();
  const { location, loading: locationLoading, error: locationError, gpsResolved, requestLocation } = useLocation();

  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const lat = location?.latitude ?? DEMO_SEARCH_CENTER.latitude;
      const lng = location?.longitude ?? DEMO_SEARCH_CENTER.longitude;

      let [areas, ai2Recommendation] = await Promise.all([
        parkingApi.getNearbyParkingAreas({
          latitude: lat,
          longitude: lng,
          radius: NEARBY_SEARCH_RADIUS_METERS || 50000
        }),
        recommendApi.getRecommendation({
          latitude: lat,
          longitude: lng,
          radius: NEARBY_SEARCH_RADIUS_METERS || 50000
        }).catch(() => ({ recommendationAvailable: false }))
      ]);

      if (!areas || areas.length === 0) {
        areas = await parkingApi.getAllParkingAreas();
      }

      setParkingAreas(areas || []);
      if (areas && areas.length > 0) {
        setSelectedParkingId(areas[0].id);
      } else {
        setSelectedParkingId(null);
      }

      if (ai2Recommendation?.recommendationAvailable) {
        setRecommendation({
          recommendationAvailable: true,
          recommendedParkingAreaId: ai2Recommendation.recommendedParkingAreaId,
          recommendedSlotNumber: ai2Recommendation.recommendedSlotNumber,
          recommendedParkingAreaName: ai2Recommendation.recommendedParkingAreaName,
          score: ai2Recommendation.score,
          reason: ai2Recommendation.reason || ai2Recommendation.message
        });
      } else {
        setRecommendation(null);
      }

      try {
        const activeBooking = await bookingApi.getCurrentBooking();
        setCurrentBooking(activeBooking);
      } catch {
        setCurrentBooking(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to load nearby parking data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (!locationLoading) {
      fetchDashboardData();
    }
  }, [location, locationLoading, fetchDashboardData]);

  const filteredParkingAreas = parkingAreas.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedParking = parkingAreas.find((p) => p.id === selectedParkingId) || parkingAreas[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const locationLabel = locationLoading
    ? 'Retrieving GPS...'
    : locationError
    ? DEMO_SEARCH_CENTER.label
    : gpsResolved
    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : DEMO_SEARCH_CENTER.label;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 block">
            User Dashboard
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {greeting}, {user?.name || 'Valued User'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find a parking spot near you with live availability
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs">
          <div className="p-2 bg-brand-500/10 rounded-xl text-brand-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Search location</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{locationLabel}</span>
          </div>
          <button
            onClick={requestLocation}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors ml-1"
            title="Refresh Location"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {locationError && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search parking by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 shadow-sm text-slate-900 dark:text-slate-100"
        />
      </div>

      {loading || locationLoading ? (
        <LoadingState message="Loading nearby parking hubs..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboardData} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <MapView
                userLocation={location}
                parkingAreas={filteredParkingAreas}
                selectedParkingId={selectedParkingId}
                onSelectParking={(id) => {
                  setSelectedParkingId(id);
                  navigate(`/parking/${id}`);
                }}
              />

              <RecommendationCard
                recommendationData={recommendation}
                onSelect={(id) => navigate(`/parking/${id}`)}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Nearby Parking Areas ({filteredParkingAreas.length})
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Radius: {NEARBY_SEARCH_RADIUS_METERS}m</span>
                </div>

                {filteredParkingAreas.length === 0 ? (
                  <EmptyState
                    title={searchQuery ? 'No Matching Parking Areas' : 'No Parking Areas Within 500m'}
                    message={
                      searchQuery
                        ? 'No parking facilities match your search query.'
                        : 'No parking areas are registered within 500 meters of your current location.'
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredParkingAreas.map((parking) => (
                      <ParkingCard
                        key={parking.id}
                        parking={parking}
                        onSelect={(id) => {
                          setSelectedParkingId(id);
                          navigate(`/parking/${id}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {selectedParking && (
                <OccupancyCard
                  occupancyData={{
                    totalSlots: selectedParking.totalSlots,
                    availableSlots: selectedParking.availableSlots,
                    occupiedSlots: selectedParking.occupiedSlots,
                    occupancyPercentage: selectedParking.occupancyPercentage
                  }}
                />
              )}

              <CurrentBookingCard booking={currentBooking} />
              <QuickAction />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
