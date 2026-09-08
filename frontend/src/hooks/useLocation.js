import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        let message = "Unable to retrieve your location.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location access denied by user. Defaulting to city center location.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            break;
        }
        setError(message);
        // Fallback default coordinates (Bangalore Tech Park)
        setLocation({ latitude: 12.9716, longitude: 77.5946 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, loading, error, requestLocation };
}

export default useLocation;
