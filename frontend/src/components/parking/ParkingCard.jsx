import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Sparkles, ParkingSquare, Car } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatDistance, getOccupancyStatus } from '../../utils/formatters';

export default function ParkingCard({ parking, isRecommended = false, recommendationReason }) {
  const {
    id,
    name,
    address,
    distance,
    hourlyRate,
    totalSlots,
    availableSlots,
    occupancyPercentage
  } = parking;

  const occupancyInfo = getOccupancyStatus(occupancyPercentage);

  return (
    <div className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
      isRecommended ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 dark:border-slate-800'
    }`}>
      
      {/* Recommended Pill */}
      {isRecommended && (
        <div className="absolute -top-3 left-4 bg-brand-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Recommended for You</span>
        </div>
      )}

      <div>
        {/* Header: Name & Rate */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{address}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-black text-brand-600 dark:text-brand-400">
              {formatCurrency(hourlyRate)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">/ hour</span>
          </div>
        </div>

        {recommendationReason && (
          <div className="bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/40 rounded-xl p-2.5 mb-3 text-xs text-brand-800 dark:text-brand-300">
            <strong>AI Note:</strong> {recommendationReason}
          </div>
        )}

        {/* Distance & Occupancy Pill */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
              {formatDistance(distance)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Slots Available</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-black text-slate-900 dark:text-white">{availableSlots}</span>
              <span className="text-[10px] text-slate-500">/ {totalSlots}</span>
            </div>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Occupancy</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${occupancyInfo.color}`}>
              {occupancyPercentage}% ({occupancyInfo.label})
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercentage >= 90 ? 'bg-red-500' : occupancyPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Link to={`/parking/${id}`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            View Parking
          </Button>
        </Link>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${parking.latitude},${parking.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-500 hover:text-brand-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          title="Get Directions"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
