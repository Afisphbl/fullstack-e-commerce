import axios from "axios";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { getAuthToken } from "@/lib/api-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sections map strictly to the SiteSettings interface and backend routes
export type SettingsSection =
  | "general"
  | "hero"
  | "about"
  | "contact"
  | "social"
  | "commerce"
  | "preferences";

export const SECTIONS: SettingsSection[] = [
  "general",
  "hero",
  "about",
  "contact",
  "social",
  "commerce",
  "preferences",
];

/**
 * Fetches all settings sections in parallel and merges them into a single object.
 */
export const fetchAllSettings = async (): Promise<Partial<SiteSettings>> => {
  try {
    const promises = SECTIONS.map((section) =>
      axiosInstance.get(`/settings/${section}`)
    );

    // Use Promise.allSettled so if one fails (e.g. auth required and user not logged in),
    // the public ones still load.
    const results = await Promise.allSettled(promises);

    let mergedSettings: Partial<SiteSettings> = {};

    results.forEach((result) => {
      if (
        result.status === "fulfilled" &&
        result.value.data.status === "success"
      ) {
        const itemData = result.value.data.data.data;
        // Merge the API document fields into the result
        mergedSettings = { ...mergedSettings, ...itemData };
      } else if (result.status === "rejected") {
        console.error(`Settings fetch error:`, result.reason);
      }
    });

    return mergedSettings;
  } catch (error) {
    console.error("Failed to fetch settings from API", error);
    return {};
  }
};

/**
 * Patches a specific settings section on the backend.
 * Uses withCredentials to send the admin JWT cookie.
 */
export const updateSettingsSection = async (
  section: SettingsSection,
  data: Partial<SiteSettings>,
) => {
  const response = await axiosInstance.patch(`/settings/${section}`, data);
  return response.data;
};
