import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export const Footer = () => {
  const { openCart } = useCart();
  const { settings } = useSiteSettings();

  return (
    <footer className='bg-card border-t border-border mt-auto'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h3 className='font-display text-lg font-bold text-gradient mb-4'>
              {settings.companyName.toUpperCase()}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {settings.description}
            </p>
          </div>
          <div>
            <h4 className='font-display text-sm font-semibold mb-4 text-foreground'>
              Quick Links
            </h4>
            <div className='flex flex-col gap-2'>
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
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  {link.l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className='font-display text-sm font-semibold mb-4 text-foreground'>
              Account
            </h4>
            <div className='flex flex-col gap-2'>
              {[
                { to: "/profile", l: "Profile" },
                { to: "/orders", l: "Orders" },
                { to: "/favorites", l: "Wishlist" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  {link.l}
                </Link>
              ))}
              <button
                onClick={openCart}
                className='text-left text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Cart
              </button>
            </div>
          </div>
          <div>
            <h4 className='font-display text-sm font-semibold mb-4 text-foreground'>
              Contact
            </h4>
            <div className='flex flex-col gap-3 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-primary' />{" "}
                {settings.contactEmail}
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-primary' />{" "}
                {settings.contactPhone}
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-primary' />{" "}
                {settings.contactAddress}
              </div>
            </div>
          </div>
        </div>
        <div className='border-t border-border mt-6 pt-5 text-center text-sm text-muted-foreground'>
          © {new Date().getFullYear()} {settings.companyName}. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};
