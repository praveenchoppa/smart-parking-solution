import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair } from 'lucide-react';
import { formatDistance } from '../utils/formatters';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export default function MapView({
  userLocation,
  parkingAreas = [],
  selectedParkingId,
  onSelectParking
}) {
  const centerLat = userLocation?.latitude || 12.9716;
  const centerLng = userLocation?.longitude || 77.5946;

  const selectedParking = parkingAreas.find((p) => p.id === selectedParkingId) || parkingAreas[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
      
      {/* Header Info Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono text-slate-300">
            OpenStreetMap Radius Radar ({parkingAreas.length} Nearby Hubs)
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {userLocation && (
            <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
              📍 User GPS: {userLocation.latitude?.toFixed(4)}, {userLocation.longitude?.toFixed(4)}
            </span>
          )}

          {selectedParking && (
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lot GPS: {Number(selectedParking.latitude).toFixed(4)}, {Number(selectedParking.longitude).toFixed(4)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div className="h-72 w-full relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {parkingAreas.map((parking) => (
            <Marker
              key={parking.id}
              position={[parking.latitude || centerLat, parking.longitude || centerLng]}
              eventHandlers={{
                click: () => onSelectParking && onSelectParking(parking.id)
              }}
            >
              <Popup>
                <div className="font-sans text-xs space-y-1">
                  <h4 className="font-bold text-slate-900">{parking.name}</h4>
                  <p className="text-slate-500">{parking.address}</p>
                  <div className="flex justify-between items-center font-mono font-bold text-emerald-600 pt-1">
                    <span>{parking.availableSlots} Free</span>
                    <span>₹{parking.hourlyRate}/hr</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom Parking Marker Grid List */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {parkingAreas.map((parking, index) => {
          const isSelected = selectedParkingId === parking.id;
          return (
            <div
              key={parking.id}
              onClick={() => onSelectParking && onSelectParking(parking.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-md'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-200'
                  }`}>
                    P{index + 1}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {parking.availableSlots} Slots Free
                  </span>
                </div>
                <h4 className="text-xs font-bold truncate">{parking.name}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{parking.address}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{formatDistance(parking.distance)}</span>
                <span>₹{parking.hourlyRate}/hr</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
