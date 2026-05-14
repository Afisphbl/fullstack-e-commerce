import { useState, useEffect } from "react";
import { fetchGeneralSettings } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface LocationCheckResult {
  isDeliveryAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useLocationCheck = (): LocationCheckResult => {
  const { user } = useAuth();
  const [isDeliveryAvailable, setIsDeliveryAvailable] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkLocation = async () => {
      try {
        const settings = await fetchGeneralSettings();
        if (!settings?.enableLocationRestriction) {
          if (isMounted) {
            setIsDeliveryAvailable(true);
            setIsLoading(false);
          }
          return;
        }

        const allowedCities: string[] = (
          (settings.allowedDeliveryCities as string[]) || []
        ).map((c: string) => c.toLowerCase());

        if (isMounted) {
          if (!user) {
            // For guests, we can't reliably know their city without GPS. Default to true.
            // Checkout strictly validates the city entered anyway.
            setIsDeliveryAvailable(true);
          } else {
            // Find default user city from addresses
            const defaultAddress =
              user.addresses?.find(
                (a: { isDefault?: boolean; city?: string }) => a.isDefault
              ) || user.addresses?.[0];
            const userCity = defaultAddress?.city?.toLowerCase() || null;

            if (userCity) {
              const allowed = allowedCities.includes(userCity);
              setIsDeliveryAvailable(allowed);
            } else {
              // Known user but no address set yet; let them browse
              setIsDeliveryAvailable(true);
            }
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
        if (isMounted) {
          setIsDeliveryAvailable(false); // Stay restricted on failure for safety
          setIsLoading(false);
        }
      }
    };

    checkLocation();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { isDeliveryAvailable, isLoading, error };
};
