import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import commonAm from "./am/common.json";
import commonEn from "./en/common.json";
import commonOm from "./om/common.json";

import navigationAm from "./am/navigation.json";
import navigationEn from "./en/navigation.json";
import navigationOm from "./om/navigation.json";

import productAm from "./am/product.json";
import productEn from "./en/product.json";
import productOm from "./om/product.json";

import aboutAm from "./am/about.json";
import aboutEn from "./en/about.json";
import aboutOm from "./om/about.json";

import footerAm from "./am/footer.json";
import footerEn from "./en/footer.json";
import footerOm from "./om/footer.json";

import shopAm from "./am/shop.json";
import shopEn from "./en/shop.json";
import shopOm from "./om/shop.json";

import cartAm from "./am/cart.json";
import cartEn from "./en/cart.json";
import cartOm from "./om/cart.json";

import homeAm from "./am/home.json";
import homeEn from "./en/home.json";
import homeOm from "./om/home.json";

import profileAm from "./am/profile.json";
import profileEn from "./en/profile.json";
import profileOm from "./om/profile.json";

import contactAm from "./am/contact.json";
import contactEn from "./en/contact.json";
import contactOm from "./om/contact.json";

import faqAm from "./am/faq.json";
import faqEn from "./en/faq.json";
import faqOm from "./om/faq.json";

import authAm from "./am/auth.json";
import authEn from "./en/auth.json";
import authOm from "./om/auth.json";

import adminAm from "./am/admin.json";
import adminEn from "./en/admin.json";
import adminOm from "./om/admin.json";

import compareAm from "./am/compare.json";
import compareEn from "./en/compare.json";
import compareOm from "./om/compare.json";
import checkoutAm from "./am/checkout.json";
import checkoutEn from "./en/checkout.json";
import checkoutOm from "./om/checkout.json";

// Configure i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      am: {
        common: commonAm,
        navigation: navigationAm,
        product: productAm,
        about: aboutAm,
        footer: footerAm,
        shop: shopAm,
        cart: cartAm,
        home: homeAm,
        profile: profileAm,
        contact: contactAm,
        faq: faqAm,
        auth: authAm,
        admin: adminAm,
        compare: compareAm,
        checkout: checkoutAm,
      },
      en: {
        common: commonEn,
        navigation: navigationEn,
        product: productEn,
        about: aboutEn,
        footer: footerEn,
        shop: shopEn,
        cart: cartEn,
        home: homeEn,
        profile: profileEn,
        contact: contactEn,
        faq: faqEn,
        auth: authEn,
        admin: adminEn,
        compare: compareEn,
        checkout: checkoutEn,
      },
      om: {
        common: commonOm,
        navigation: navigationOm,
        product: productOm,
        about: aboutOm,
        footer: footerOm,
        shop: shopOm,
        cart: cartOm,
        home: homeOm,
        profile: profileOm,
        contact: contactOm,
        faq: faqOm,
        auth: authOm,
        admin: adminOm,
        compare: compareOm,
        checkout: checkoutOm,
      },
    },
    fallbackLng: "am", // Amharic as default
    defaultNS: "common",
    ns: [
      "common",
      "navigation",
      "product",
      "about",
      "footer",
      "shop",
      "cart",
      "home",
      "profile",
      "contact",
      "faq",
      "auth",
      "admin",
      "compare",
      "checkout",
    ],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ["localStorage", "navigator", "htmlTag"],
      // Cache user language preference
      caches: ["localStorage"],
      // localStorage key
      lookupLocalStorage: "i18nextLng",
    },

    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

export default i18n;
