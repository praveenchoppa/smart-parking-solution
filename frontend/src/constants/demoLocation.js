/** GPS fallback when browser geolocation is unavailable (matches backend demo parking region). */
export const DEMO_SEARCH_CENTER = {
  latitude: 9.7553,
  longitude: 76.6499,
  label: 'Demo search center (City Mall Main Lot)'
};

export const NEARBY_SEARCH_RADIUS_METERS = 500;

/** Existing AI-1 Flask live monitor (video/CCTV demo UI). */
export const AI1_MONITOR_URL = import.meta.env.VITE_AI1_MONITOR_URL || 'http://localhost:5000';
