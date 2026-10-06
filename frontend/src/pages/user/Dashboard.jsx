import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { parkingApi } from '../../services/api/parkingApi';
import { bookingApi } from '../../services/api/bookingApi';

// Reusable Components
import MapView from '../../components/MapView';
import ParkingCard from '../../components/ParkingCard';
import OccupancyCard from '../../components/OccupancyCard';
import RecommendationCard from '../../components/RecommendationCard';
import CurrentBookingCard from '../../components/CurrentBookingCard';
import QuickAction from '../../components/QuickAction';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Button from '../../components/common/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const { location, loading: locationLoading, error: locationError, requestLocation } = useLocation();

  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch nearby parking areas from API service wrapper
      const lat = location?.latitude || 12.9716;
      const lng = location?.longitude || 77.5946;

      const areas = await parkingApi.getNearbyParkingAreas({
        latitude: lat,
        longitude: lng,
        radius: 500
      });

      setParkingAreas(areas || []);
      if (areas && areas.length > 0) {
        setSelectedParkingId(areas[0].id);
      }

      // 2. Fetch current active booking if available
      try {
        const activeBooking = await bookingApi.getCurrentBooking();
        setCurrentBooking(activeBooking);
      } catch (e) {
        setCurrentBooking(null);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Unable to load nearby parking data. Please try again.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location]);

  // Client-side search filtering of returned dataset (Section 6 & 14 requirement)
  const filteredParkingAreas = parkingAreas.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedParking = parkingAreas.find((p) => p.id === selectedParkingId) || parkingAreas[0];

  // Derive time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Welcome Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 block">
            Member 2 — User Dashboard
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {greeting}, {user?.name || 'Valued User'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find a parking spot near you with live availability
          </p>
        </div>

        {/* 2. Location Section */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs">
          <div className="p-2 bg-brand-500/10 rounded-xl text-brand-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">📍 Current Location</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {locationLoading
                ? 'Retrieving GPS...'
                : locationError
                ? 'Default Coordinates (Bangalore)'
                : `${location?.latitude?.toFixed(4)}, ${location?.longitude?.toFixed(4)}`}
            </span>
          </div>
          <button
            onClick={requestLocation}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors ml-1"
            title="Refresh Location"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Location Error Warning if denied */}
      {locationError && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* 3. Search Bar Input */}
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

      {loading ? (
        <LoadingState message="Loading nearby parking hubs..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboardData} />
      ) : (
        <>
          {/* Desktop Dual-Column Layout / Mobile Vertical Stacking */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Main Column: Map & Nearby Parking Grid */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 4. Map Section */}
              <MapView
                userLocation={location}
                parkingAreas={filteredParkingAreas}
                selectedParkingId={selectedParkingId}
                onSelectParking={(id) => {
                  setSelectedParkingId(id);
                  navigate(`/parking/${id}`);
                }}
              />

              {/* 5. Recommended Parking Placeholder (AI-2 Ready) */}
              <RecommendationCard
                recommendationData={
                  selectedParking?.recommendationAvailable ? {
                    recommendationAvailable: true,
                    recommendedParkingAreaId: selectedParking.id,
                    score: 0.94,
                    reason: selectedParking.recommendationReason || "Nearby parking with good availability near you."
                  } : null
                }
                onSelect={(id) => navigate(`/parking/${id}`)}
              />

              {/* 6. Nearby Parking Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Nearby Parking Areas ({filteredParkingAreas.length})
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Radius: 500m</span>
                </div>

                {filteredParkingAreas.length === 0 ? (
                  <EmptyState
                    title="No Parking Areas Found"
                    message="No parking facilities match your search query."
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

            {/* Right Column: Occupancy Overview, Current Booking & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 7. Occupancy Component (AI-1 Consumer Ready) */}
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

              {/* 8. Current Booking Section */}
              <CurrentBookingCard booking={currentBooking} />

              {/* 9. Quick Actions */}
              <QuickAction />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
