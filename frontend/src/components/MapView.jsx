import React from 'react';
import { MapPin, Navigation, Car, Sparkles, Crosshair } from 'lucide-react';
import { formatDistance } from '../utils/formatters';

export default function MapView({
  userLocation,
  parkingAreas = [],
  selectedParkingId,
  onSelectParking
}) {
  const selectedParking = parkingAreas.find((p) => p.id === selectedParkingId) || parkingAreas[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[440px] relative overflow-hidden flex flex-col justify-between shadow-2xl">
      
      {/* Background Radar Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono text-slate-300">
            Interactive City Radar Map ({parkingAreas.length} Parking Hubs)
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {userLocation && (
            <span className="text-[11px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
              📍 User GPS: {userLocation.latitude?.toFixed(4)}, {userLocation.longitude?.toFixed(4)}
            </span>
          )}

          {selectedParking && (
            <span className="text-[11px] font-bold text-brand-300 bg-brand-600/30 border border-brand-500/40 px-3 py-1 rounded-xl flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>Lot GPS: {selectedParking.latitude?.toFixed(4)}, {selectedParking.longitude?.toFixed(4)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Parking Markers Grid View */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
        {parkingAreas.map((parking, index) => {
          const isSelected = selectedParkingId === parking.id;
          const latStr = parking.latitude ? Number(parking.latitude).toFixed(4) : 'N/A';
          const lngStr = parking.longitude ? Number(parking.longitude).toFixed(4) : 'N/A';

          return (
            <div
              key={parking.id}
              onClick={() => onSelectParking && onSelectParking(parking.id)}
              className={`backdrop-blur rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] border flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-600/90 border-brand-400 ring-2 ring-brand-400 text-white shadow-xl'
                  : 'bg-slate-800/90 border-slate-700 hover:border-brand-500 text-slate-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                    isSelected ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'
                  }`}>
                    P{index + 1}
                  </span>

                  <span className={`text-[11px] font-bold ${
                    isSelected ? 'text-white' : 'text-emerald-400'
                  }`}>
                    {parking.availableSlots} Slots Free
                  </span>
                </div>

                <h4 className="text-sm font-bold truncate">{parking.name}</h4>
                <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1">{parking.address}</p>

                {/* Explicit GPS Coordinates Badge */}
                <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-black/30 text-brand-200 border border-white/10">
                  <MapPin className="w-3 h-3 text-brand-400" />
                  <span>GPS: {latStr}, {lngStr}</span>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                <span>{formatDistance(parking.distance)}</span>
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${parking.latitude},${parking.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-brand-300 hover:text-white font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md transition-colors"
                  title="Open GPS Directions"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Nav</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Helper Note */}
      <div className="text-center text-xs text-slate-400 z-10 font-medium">
        Click any marker card above to view parking details & select location.
      </div>
    </div>
  );
}
