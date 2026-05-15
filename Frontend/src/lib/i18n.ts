import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ── Amharic (default) ──────────────────────────────────────────────────────────
import amCommon from "../locales/am/common.json";
import amAuth from "../locales/am/auth.json";
import amShop from "../locales/am/shop.json";
import amCheckout from "../locales/am/checkout.json";
import amAccount from "../locales/am/account.json";
import amErrors from "../locales/am/errors.json";
import amAdmin from "../locales/am/admin.json";
import amSettings from "../locales/am/settings.json";

// ── English ────────────────────────────────────────────────────────────────────
import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enShop from "../locales/en/shop.json";
import enCheckout from "../locales/en/checkout.json";
import enAccount from "../locales/en/account.json";
import enErrors from "../locales/en/errors.json";
import enAdmin from "../locales/en/admin.json";
import enSettings from "../locales/en/settings.json";

// ── Afaan Oromo ────────────────────────────────────────────────────────────────
import omCommon from "../locales/om/common.json";
import omAuth from "../locales/om/auth.json";
import omShop from "../locales/om/shop.json";
import omCheckout from "../locales/om/checkout.json";
import omAccount from "../locales/om/account.json";
import omErrors from "../locales/om/errors.json";
import omAdmin from "../locales/om/admin.json";
import omSettings from "../locales/om/settings.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default language: Amharic
    fallbackLng: "am",
    supportedLngs: ["am", "en", "om"],
    defaultNS: "common",
    ns: [
      "common",
      "auth",
      "shop",
      "checkout",
      "account",
      "errors",
      "admin",
      "settings",
    ],
    resources: {
      am: {
        common: amCommon,
        auth: amAuth,
        shop: amShop,
        checkout: amCheckout,
        account: amAccount,
        errors: amErrors,
        admin: amAdmin,
        settings: amSettings,
      },
      en: {
        common: enCommon,
        auth: enAuth,
        shop: enShop,
        checkout: enCheckout,
        account: enAccount,
        errors: enErrors,
        admin: enAdmin,
        settings: enSettings,
      },
      om: {
        common: omCommon,
        auth: omAuth,
        shop: omShop,
        checkout: omCheckout,
        account: omAccount,
        errors: omErrors,
        admin: omAdmin,
        settings: omSettings,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Check localStorage first, then browser language
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "voltedge_lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
