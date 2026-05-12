import axios from "axios";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { getAuthToken } from "@/lib/api-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

const PUBLIC_SECTIONS: SettingsSection[] = [
  "general",
  "hero",
  "about",
  "contact",
  "social",
];
const ADMIN_SECTIONS: SettingsSection[] = ["commerce", "preferences"];

const fetchSections = async (
  sections: SettingsSection[]
): Promise<Partial<SiteSettings>> => {
  try {
    const promises = sections.map((section) =>
      axiosInstance.get(`/settings/${section}`)
    );

    const results = await Promise.allSettled(promises);
    let mergedSettings: Partial<SiteSettings> = {};

    results.forEach((result) => {
      if (
        result.status === "fulfilled" &&
        result.value.data.status === "success"
      ) {
        const itemData = result.value.data.data.data;
        mergedSettings = { ...mergedSettings, ...itemData };
      }
    });

    return mergedSettings;
  } catch (error) {
    console.error("Failed to fetch settings from API", error);
    return {};
  }
};

export const fetchPublicSettings = () => fetchSections(PUBLIC_SECTIONS);
export const fetchAdminSettings = () => fetchSections(ADMIN_SECTIONS);

export const fetchAllSettings = async (): Promise<Partial<SiteSettings>> => {
  return fetchSections(SECTIONS);
};

export const updateSettingsSection = async (
  section: SettingsSection,
  data: Partial<SiteSettings>
) => {
  const response = await axiosInstance.patch(`/settings/${section}`, data);
  return response.data;
};
