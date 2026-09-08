import React from 'react';
import { Sparkles, MapPin, CheckCircle } from 'lucide-react';
import Button from './Button';

export default function RecommendationBanner({ recommendation, onSelect }) {
  if (!recommendation || !recommendation.recommendationAvailable) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 text-white rounded-2xl p-5 mb-6 shadow-xl border border-brand-500/30">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-brand-500/20 rounded-2xl border border-brand-400/30 text-brand-300 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-400/20 text-brand-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-400/30 uppercase tracking-wider">
                AI-2 Recommendation
              </span>
              {recommendation.score && (
                <span className="text-xs text-brand-300 font-mono font-medium">
                  Match Score: {(recommendation.score * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Recommended for You</h3>
            <p className="text-xs text-brand-200 mt-0.5 leading-relaxed max-w-xl">
              {recommendation.reason || "Nearby parking with high slot availability and minimal friction."}
            </p>
          </div>
        </div>
        {onSelect && (
          <Button
            onClick={() => onSelect(recommendation.recommendedParkingAreaId)}
            variant="accent"
            size="md"
            className="w-full sm:w-auto shrink-0 shadow-lg shadow-emerald-900/30"
          >
            Select Recommended Lot
          </Button>
        )}
      </div>
    </div>
  );
}
