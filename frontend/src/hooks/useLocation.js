import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState({ latitude: 12.9716, longitude: 77.5946 }); // Default fallback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setError("Geolocation is not supported by your browser. Using default city center coordinates.");
      setLocation({ latitude: 12.9716, longitude: 77.5946 });
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
          }
          setLoading(false);
        },
        (err) => {
          let message = "Location permission blocked by browser. Using default city center coordinates.";
          if (err) {
            switch (err.code) {
              case err.PERMISSION_DENIED:
                message = "Location permission blocked. Using default city center coordinates.";
                break;
              case err.POSITION_UNAVAILABLE:
                message = "Location unavailable. Using default city center coordinates.";
                break;
              case err.TIMEOUT:
                message = "Location request timed out. Using default city center coordinates.";
                break;
              default:
                break;
            }
          }
          setError(message);
          setLocation({ latitude: 12.9716, longitude: 77.5946 });
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } catch (e) {
      setError("Location request failed. Using default city center coordinates.");
      setLocation({ latitude: 12.9716, longitude: 77.5946 });
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, loading, error, requestLocation };
}

export default useLocation;
