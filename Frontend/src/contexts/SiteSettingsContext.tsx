import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchPublicSettings,
  fetchAdminSettings,
  updateSettingsSection,
  SECTIONS,
  SettingsSection,
} from "@/lib/api/settings";
import { useAuth } from "./AuthContext";
import { isAdminRole } from "@/lib/roles";

export interface HeroSlide {
  image: string;
  title: { am: string; en: string; om: string } | string;
  subtitle: { am: string; en: string; om: string } | string;
}

export interface AboutStat {
  value: string;
  label: { am: string; en: string; om: string } | string;
}

export interface AboutValue {
  title: { am: string; en: string; om: string } | string;
  desc: { am: string; en: string; om: string } | string;
}

export interface SiteSettings {
  // General
  companyName: { am: string; en: string; om: string } | string;
  tagline: { am: string; en: string; om: string } | string;
  logoUrl: string;
  description: { am: string; en: string; om: string } | string;
  enableLocationRestriction: boolean;
  allowedDeliveryCities: string[];

  // Hero
  heroEyebrow: { am: string; en: string; om: string } | string;
  heroTitle: { am: string; en: string; om: string } | string;
  heroHighlight: { am: string; en: string; om: string } | string;
  heroSubtitle: { am: string; en: string; om: string } | string;
  heroCtaText: { am: string; en: string; om: string } | string;
  heroCtaLink: string;
  heroSlides: HeroSlide[];

  // About
  aboutEyebrow: { am: string; en: string; om: string } | string;
  aboutTitle: { am: string; en: string; om: string } | string;
  aboutHighlight: { am: string; en: string; om: string } | string;
  aboutIntro: { am: string; en: string; om: string } | string;
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
  supportedLanguages: string[];
}

const DEFAULTS: SiteSettings = {
  companyName: {
    am: "VoltEdge ኤሌክትሮኒክስ",
    en: "VoltEdge Electronics",
    om: "VoltEdge Electronics",
  },
  tagline: {
    am: "ቀጣዩ ትውልድ ኤሌክትሮኒክስ",
    en: "Next-Gen Electronics",
    om: "Next-Gen Electronics",
  },
  logoUrl: "",
  description: {
    am: "ጥራት ላላቸው ኤሌክትሮኒክስ ውጤቶች ቀዳሚ ምርጫዎ።",
    en: "Your premium destination for cutting-edge electronics.",
    om: "Your premium destination for cutting-edge electronics.",
  },
  enableLocationRestriction: false,
  allowedDeliveryCities: ["Addis Ababa"],

  heroEyebrow: {
    am: "ቀጣዩ ትውልድ ኤሌክትሮኒክስ",
    en: "NEXT-GEN ELECTRONICS",
    om: "NEXT-GEN ELECTRONICS",
  },
  heroTitle: { am: "የወደፊቱን", en: "Experience The", om: "Experience The" },
  heroHighlight: { am: "ልምድ", en: "Future", om: "Future" },
  heroSubtitle: {
    am: "አቻ የማይገኝለት አፈፃፀም ያላቸውን ዘመናዊ ኤሌክትሮኒክስ ያግኙ። ከ AI ላፕቶፖች እስከ ኳንተም ማሳያዎች — የነገውን ቴክኖሎጂ ዛሬ እናቀርባለን።",
    en: "Discover cutting-edge electronics with unmatched performance. From AI-powered laptops to quantum displays — we bring tomorrow's tech today.",
    om: "Discover cutting-edge electronics with unmatched performance. From AI-powered laptops to quantum displays — we bring tomorrow's tech today.",
  },
  heroCtaText: { am: "አሁን ይግዙ", en: "Shop Now", om: "Amma Bituu" },
  heroCtaLink: "/shop",
  heroSlides: [
    {
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
      title: {
        am: "ኃይለኛ ላፕቶፖች",
        en: "Powerful Laptops",
        om: "Powerful Laptops",
      },
      subtitle: {
        am: "ለፈጣሪዎች እና ለባለሙያዎች የተሰራ",
        en: "Built for creators and pros",
        om: "Built for creators and pros",
      },
    },
    {
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200",
      title: {
        am: "ዘመናዊ ስልኮች",
        en: "Smart Flagship Phones",
        om: "Smart Flagship Phones",
      },
      subtitle: {
        am: "አፈፃፀም ከውበት ጋር",
        en: "Performance meets elegance",
        om: "Performance meets elegance",
      },
    },
    {
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200",
      title: {
        am: "ጥርት ያሉ ማሳያዎች",
        en: "Ultra-Clear Displays",
        om: "Ultra-Clear Displays",
      },
      subtitle: {
        am: "ዝርዝር ሁኔታን የሚገልጹ ምስሎች",
        en: "Visuals that redefine detail",
        om: "Visuals that redefine detail",
      },
    },
  ],

  aboutEyebrow: { am: "እኛ ማን ነን", en: "Who We Are", om: "Nu Eenyu" },
  aboutTitle: { am: "ስለ", en: "About", om: "Waa’ee" },
  aboutHighlight: { am: "VoltEdge", en: "VoltEdge", om: "VoltEdge" },
  aboutIntro: {
    am: "ተደራሽ የሆኑ ዘመናዊ ቴክኖሎጂዎችን ለማቅረብ እየሰራን ነው። ቮልትኤጅ በ2020 ከተመሰረተ ጊዜ ጀምሮ በሚሊዮኖች የሚቆጠሩ ደንበኞች የሚተማመኑበት ዓለም አቀፍ የኤሌክትሮኒክስ መዳረሻ ሆኗል።",
    en: "We're on a mission to make cutting-edge technology accessible to everyone. Founded in 2020, VoltEdge has grown from a small startup to a global electronics destination trusted by millions.",
    om: "We're on a mission to make cutting-edge technology accessible to everyone. Founded in 2020, VoltEdge has grown from a small startup to a global electronics destination trusted by millions.",
  },
  aboutImage:
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
  aboutStats: [
    {
      value: "2M+",
      label: {
        am: "ደስተኛ ደንበኞች",
        en: "Happy Customers",
        om: "Maamiltoota Gammadan",
      },
    },
    { value: "50+", label: { am: "አገሮች", en: "Countries", om: "Biyyoota" } },
    { value: "10K+", label: { am: "ምርቶች", en: "Products", om: "Oomishaalee" } },
    {
      value: "99%",
      label: { am: "እርካታ", en: "Satisfaction", om: "Gammachuu" },
    },
  ],
  aboutValues: [
    {
      title: { am: "እምነት ይቀድማል", en: "Trust First", om: "Amaanatiif Dursa" },
      desc: {
        am: "ግልጽ ዋጋ፣ የተረጋገጡ ምርቶች እና ደህንነታቸው የተጠበቀ ግብይቶች።",
        en: "Transparent pricing, verified products, and secure transactions.",
        om: "Transparent pricing, verified products, and secure transactions.",
      },
    },
    {
      title: { am: "ፈጠራ በየቀኑ", en: "Innovate Daily", om: "Daily Innovate" },
      desc: {
        am: "የዕለት ተዕለት ኑሮን የሚያሻሽሉ ቴክኖሎጂዎችን በየጊዜው እንመረምራለን።",
        en: "We constantly explore technologies that improve everyday life.",
        om: "We constantly explore technologies that improve everyday life.",
      },
    },
    {
      title: {
        am: "ደንበኛ ተኮር",
        en: "Customer Obsessed",
        om: "Maamila Jaallachuu",
      },
      desc: {
        am: "እያንዳንዱ ውሳኔ የሚጀምረው በደንበኞች ዋጋ እና አጠቃቀም ነው።",
        en: "Every decision starts with customer value and usability.",
        om: "Every decision starts with customer value and usability.",
      },
    },
    {
      title: { am: "በፍጥነት መንቀሳቀስ", en: "Move Fast", om: "Saffisaan Deemuu" },
      desc: {
        am: "የተሻሉ ተሞክሮዎችን በፍጥነት እናቀርባለን እና በዓላማ እናሻሽላለን።",
        en: "We ship better experiences quickly and iterate with purpose.",
        om: "We ship better experiences quickly and iterate with purpose.",
      },
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
  supportedLanguages: ["en", "am", "om"],
};

const STORAGE_KEY = "voltedge_site_settings";

interface Ctx {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  save: (s: SiteSettings, targetSection?: SettingsSection) => Promise<void>;
  reset: () => void;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<Ctx | null>(null);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
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

  // Load public settings on mount
  useEffect(() => {
    let active = true;
    const loadPublic = async () => {
      try {
        const apiSettings = await fetchPublicSettings();
        if (active && Object.keys(apiSettings).length > 0) {
          setSettings((prev) => {
            const next = { ...prev, ...apiSettings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch (error) {
        console.error("Failed to load public settings", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadPublic();
    return () => {
      active = false;
    };
  }, []);

  // Use a second effect to fetch admin-only sections if token exists and user is admin
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !user || !isAdminRole(user.role)) return;

    let active = true;
    const loadAdmin = async () => {
      try {
        const adminSettings = await fetchAdminSettings();
        if (active && Object.keys(adminSettings).length > 0) {
          setSettings((prev) => {
            const next = { ...prev, ...adminSettings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch (error) {
        // Silently fail for guests; admins will likely see errors in logs
        // This stops the 401 spam for non-admin users who happen to have a valid store token
      }
    };
    loadAdmin();
    return () => {
      active = false;
    };
  }, []);

  const save = async (s: SiteSettings, targetSection?: SettingsSection) => {
    // Optimistic UI update
    setSettings(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

    // Async save to API
    try {
      const payloads: Record<string, unknown> = {
        general: {
          companyName: s.companyName,
          tagline: s.tagline,
          logoUrl: s.logoUrl,
          description: s.description,
        },
        hero: {
          heroEyebrow: s.heroEyebrow,
          heroTitle: s.heroTitle,
          heroHighlight: s.heroHighlight,
          heroSubtitle: s.heroSubtitle,
          heroCtaText: s.heroCtaText,
          heroCtaLink: s.heroCtaLink,
          heroSlides: s.heroSlides,
        },
        about: {
          aboutEyebrow: s.aboutEyebrow,
          aboutTitle: s.aboutTitle,
          aboutHighlight: s.aboutHighlight,
          aboutIntro: s.aboutIntro,
          aboutImage: s.aboutImage,
          aboutStats: s.aboutStats,
          aboutValues: s.aboutValues,
        },
        contact: {
          contactEmail: s.contactEmail,
          contactPhone: s.contactPhone,
          contactAddress: s.contactAddress,
          workingHours: s.workingHours,
          mapLat: s.mapLat,
          mapLng: s.mapLng,
          mapZoom: s.mapZoom,
        },
        social: s.social,
        commerce: {
          taxRate: s.taxRate,
          freeShippingMin: s.freeShippingMin,
          currency: s.currency,
        },
        preferences: {
          maintenanceMode: s.maintenanceMode,
          emailNotifications: s.emailNotifications,
          supportedLanguages: s.supportedLanguages,
          enableLocationRestriction: s.enableLocationRestriction,
          allowedDeliveryCities: s.allowedDeliveryCities,
        },
      };

      // Save to backend
      const promises = targetSection
        ? [updateSettingsSection(targetSection, payloads[targetSection] || s)]
        : SECTIONS.map((section) =>
            updateSettingsSection(section, payloads[section] || s)
          );
      const results = await Promise.allSettled(promises);
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        console.error("Save failures:", failures);
        throw new Error(
          `${failures.length} section(s) failed to save to the database. Checking the backend logs can provide more info.`
        );
      }
    } catch (e) {
      console.error("Failed to save settings to API", e);
      throw e;
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
