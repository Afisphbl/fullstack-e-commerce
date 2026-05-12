import React, { createContext, useContext, useEffect, useState } from "react";

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  title: string;
  desc: string;
}

export interface SiteSettings {
  // General
  companyName: string;
  tagline: string;
  logoUrl: string;
  description: string;

  // Hero
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSlides: HeroSlide[];

  // About
  aboutEyebrow: string;
  aboutTitle: string;
  aboutHighlight: string;
  aboutIntro: string;
  aboutImage: string;
  aboutStats: AboutStat[];
  aboutValues: AboutValue[];

  // Contact
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  workingHours: string;
  mapLat: string;
  mapLng: string;
  mapZoom: string;

  // Social
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    custom: Array<{ platform: string; url: string }>;
  };

  // Commerce
  taxRate: string;
  freeShippingMin: string;
  currency: string;

  // Preferences
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

const DEFAULTS: SiteSettings = {
  companyName: "VoltEdge Electronics",
  tagline: "Next-Gen Electronics",
  logoUrl: "",
  description: "Your premium destination for cutting-edge electronics.",

  heroEyebrow: "NEXT-GEN ELECTRONICS",
  heroTitle: "Experience The",
  heroHighlight: "Future",
  heroSubtitle:
    "Discover cutting-edge electronics with unmatched performance. From AI-powered laptops to quantum displays — we bring tomorrow's tech today.",
  heroCtaText: "Shop Now",
  heroCtaLink: "/shop",
  heroSlides: [
    {
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
      title: "Powerful Laptops",
      subtitle: "Built for creators and pros",
    },
    {
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200",
      title: "Smart Flagship Phones",
      subtitle: "Performance meets elegance",
    },
    {
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200",
      title: "Ultra-Clear Displays",
      subtitle: "Visuals that redefine detail",
    },
  ],

  aboutEyebrow: "Who We Are",
  aboutTitle: "About",
  aboutHighlight: "VoltEdge",
  aboutIntro:
    "We're on a mission to make cutting-edge technology accessible to everyone. Founded in 2020, VoltEdge has grown from a small startup to a global electronics destination trusted by millions.",
  aboutImage:
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
  aboutStats: [
    { value: "2M+", label: "Happy Customers" },
    { value: "50+", label: "Countries" },
    { value: "10K+", label: "Products" },
    { value: "99%", label: "Satisfaction" },
  ],
  aboutValues: [
    {
      title: "Trust First",
      desc: "Transparent pricing, verified products, and secure transactions.",
    },
    {
      title: "Innovate Daily",
      desc: "We constantly explore technologies that improve everyday life.",
    },
    {
      title: "Customer Obsessed",
      desc: "Every decision starts with customer value and usability.",
    },
    {
      title: "Move Fast",
      desc: "We ship better experiences quickly and iterate with purpose.",
    },
  ],

  contactEmail: "support@voltedge.com",
  contactPhone: "+1 (555) 123-4567",
  contactAddress: "123 Innovation Drive, San Francisco, CA 94105",
  workingHours:
    "Mon - Fri: 9:00 AM - 8:00 PM\nSaturday: 10:00 AM - 6:00 PM\nSunday: 11:00 AM - 4:00 PM",
  mapLat: "37.7749",
  mapLng: "-122.4194",
  mapZoom: "13",

  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    youtube: "",
    custom: [],
  },

  taxRate: "8",
  freeShippingMin: "100",
  currency: "ETB",

  maintenanceMode: false,
  emailNotifications: true,
};

const STORAGE_KEY = "voltedge_site_settings";

interface Ctx {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  save: (s: SiteSettings) => void;
  reset: () => void;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<Ctx | null>(null);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      // use defaults
    }
    return DEFAULTS;
  });

  // Load from API on mount
  useEffect(() => {
    let active = true;
    const loadFromApi = async () => {
      try {
        const { fetchAllSettings } = await import("@/lib/api/settings");
        const apiSettings = await fetchAllSettings();
        if (active && Object.keys(apiSettings).length > 0) {
          setSettings((prev) => {
            const next = { ...prev, ...apiSettings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch (error) {
        console.error("Failed to load settings from API", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadFromApi();
    return () => {
      active = false;
    };
  }, []);

  const save = async (s: SiteSettings) => {
    // Optimistic UI update
    setSettings(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

    // Async save to API
    try {
      const { updateSettingsSection, SECTIONS } =
        await import("@/lib/api/settings");
      // Fire and forget saves to backend
      const promises = SECTIONS.map((section) =>
        updateSettingsSection(section, s),
      );
      await Promise.allSettled(promises);
    } catch (e) {
      console.error("Failed to save settings to API", e);
    }
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULTS);
  };

  // Keep localStorage perfectly synced on any change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  return (
    <SiteSettingsContext.Provider
      value={{ settings, setSettings, save, reset, isLoading }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx)
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
};

export const SITE_SETTINGS_DEFAULTS = DEFAULTS;
