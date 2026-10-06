import { useState, useEffect, useCallback } from 'react';
import { DEMO_SEARCH_CENTER } from '../constants/demoLocation';

export function useLocation() {
  const [location, setLocation] = useState(DEMO_SEARCH_CENTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpsResolved, setGpsResolved] = useState(false);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setError('Geolocation is not supported by your browser. Using demo search center.');
      setLocation(DEMO_SEARCH_CENTER);
      setGpsResolved(false);
      setLoading(false);
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position?.coords) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            setGpsResolved(true);
          }
          setLoading(false);
        },
        (err) => {
          let message = 'Unable to retrieve your location. Using demo search center.';
          if (err) {
            switch (err.code) {
              case err.PERMISSION_DENIED:
                message = 'Location access denied. Using demo search center for nearby parking.';
                break;
              case err.POSITION_UNAVAILABLE:
                message = 'Location information unavailable. Using demo search center.';
                break;
              case err.TIMEOUT:
                message = 'Location request timed out. Using demo search center.';
                break;
              default:
                break;
            }
          }
          setError(message);
          setLocation(DEMO_SEARCH_CENTER);
          setGpsResolved(false);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    } catch {
      setError('Location request failed. Using demo search center.');
      setLocation(DEMO_SEARCH_CENTER);
      setGpsResolved(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, gpsResolved, requestLocation };
}

export default useLocation;
