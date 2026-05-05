import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export const Footer = () => {
  const { openCart } = useCart();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-gradient mb-4">
              VOLTEDGE
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
                <Mail className="h-4 w-4 text-primary" /> support@voltedge.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> San Francisco, CA
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-5 text-center text-sm text-muted-foreground">
          © 2026 VoltEdge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
