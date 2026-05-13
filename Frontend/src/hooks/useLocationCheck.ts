import { useState, useEffect } from "react";
import { fetchGeneralSettings } from "@/lib/api";

export interface LocationCheckResult {
  isDeliveryAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

// Simple in-memory cache to avoid repeated geolocation prompts on every product card load
let cachedLocationStatus: boolean | null = null;

export const useLocationCheck = (): LocationCheckResult => {
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean>(
    cachedLocationStatus !== null ? cachedLocationStatus : true
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    cachedLocationStatus === null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If it's already cached the final result, no need to re-run
    if (cachedLocationStatus !== null) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const checkLocation = async () => {
      try {
        const settings = await fetchGeneralSettings();
        if (!settings?.enableLocationRestriction) {
          if (isMounted) {
            setIsDeliveryAvailable(true);
            setIsLoading(false);
            cachedLocationStatus = true;
          }
          return;
        }

        const allowedCities: string[] = (
          settings.allowedDeliveryCities || []
        ).map((c: string) => c.toLowerCase());

        // Ask for GPS
        if (!navigator.geolocation) {
          throw new Error("Geolocation not supported");
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (!isMounted) return;
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              const data = await res.json();

              const city = (
                data.address?.city ||
                data.address?.town ||
                data.address?.state ||
                data.address?.region ||
                ""
              ).toLowerCase();

              const allowed = allowedCities.some(
                (allowedCity) =>
                  city.includes(allowedCity) || allowedCity.includes(city)
              );

              if (isMounted) {
                setIsDeliveryAvailable(allowed);
                cachedLocationStatus = allowed;
                setIsLoading(false);
              }
            } catch (err) {
              console.error("Reverse geocoding failed", err);
              if (isMounted) {
                // Default to allowed if network fails
                setIsDeliveryAvailable(true);
                cachedLocationStatus = true;
                setIsLoading(false);
              }
            }
          },
          (err) => {
            console.warn("Geolocation denied or failed", err);
            // Default to true if user denies GPS (handled at checkout)
            if (isMounted) {
              setIsDeliveryAvailable(true);
              cachedLocationStatus = true;
              setIsLoading(false);
            }
          },
          { timeout: 5000 }
        );
      } catch (err) {
        console.error("Failed to fetch settings", err);
        if (isMounted) {
          setIsDeliveryAvailable(true);
          cachedLocationStatus = true;
          setIsLoading(false);
        }
      }
    };

    checkLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isDeliveryAvailable, isLoading, error };
};
