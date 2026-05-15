import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export const Footer = () => {
  const { t } = useTranslation("common");
  const { openCart } = useCart();
  const { settings } = useSiteSettings();

  const quickLinks = [
    { to: "/shop", label: t("nav.shop") },
    { to: "/about", label: t("nav.about") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const accountLinks = [
    { to: "/profile", label: t("nav.profile") },
    { to: "/orders", label: t("nav.orders") },
    { to: "/favorites", label: t("nav.favorites") },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg font-bold text-gradient mb-4">
              {settings.companyName.toUpperCase()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {settings.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              {t("footer.quickLinks")}
            </h4>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              {t("nav.profile")}
            </h4>
            <div className="flex flex-col gap-2">
              {accountLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={openCart}
                className="text-left text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.cart")}
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              {t("nav.contact")}
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

        {/* Bottom bar */}
        <div className="border-t border-border mt-6 pt-5 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings.companyName}.{" "}
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};
