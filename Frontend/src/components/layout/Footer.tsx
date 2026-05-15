import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { openCart } = useCart();
  const { t } = useTranslation(["footer", "navigation"]);
  const { settings } = useSiteSettings();

  // Get localized settings
  const localizedCompanyName = useLocalizedField(settings.companyName);
  const localizedDescription = useLocalizedField(settings.description);

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-gradient mb-4">
              {localizedCompanyName.toUpperCase()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {localizedDescription}
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              {t("footer:quickLinks")}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/shop", l: t("navigation:shop") },
                { to: "/about", l: t("navigation:about") },
                { to: "/blog", l: t("navigation:blog") },
                { to: "/faq", l: t("navigation:faq") },
                { to: "/contact", l: t("navigation:contact") },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              {t("footer:account")}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/profile", l: t("footer:profile") },
                { to: "/orders", l: t("footer:orders") },
                { to: "/favorites", l: t("footer:wishlist") },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.l}
                </Link>
              ))}
              <button
                onClick={openCart}
                className="text-left text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer:cart")}
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              {t("footer:contact")}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />{" "}
                {settings.contactEmail}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />{" "}
                {settings.contactPhone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />{" "}
                {settings.contactAddress}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-5 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {localizedCompanyName}.{" "}
          {t("footer:allRightsReserved")}
        </div>
      </div>
    </footer>
  );
};
