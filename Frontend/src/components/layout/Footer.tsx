import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";

export const Footer = () => {
  const { openCart } = useCart();
  const { settings } = useSettings();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-gradient mb-4 uppercase tracking-wider">
              {settings?.siteName || "VOLTEDGE"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your premium destination for cutting-edge electronics. Experience
              the future today.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/shop", l: "Shop" },
                { to: "/about", l: "About" },
                { to: "/blog", l: "Blog" },
                { to: "/faq", l: "FAQ" },
                { to: "/contact", l: "Contact" },
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
              Account
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/profile", l: "Profile" },
                { to: "/orders", l: "Orders" },
                { to: "/favorites", l: "Wishlist" },
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
                Cart
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
              Contact
            </h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> {settings?.contactEmail || "support@voltedge.com"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> {settings?.contactPhone || "+1 (555) 123-4567"}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" /> {settings?.address || "San Francisco, CA"}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-5 text-center text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} {settings?.siteName || "VoltEdge"}. All rights reserved.
          </div>
          {settings?.socialLinks && settings.socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {settings.socialLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
