import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  GitCompare,
  User,
  Shield,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

export const Header = () => {
  const { itemCount, openCart } = useCart();
  const { favorites } = useFavorites();
  const { compareList } = useCompare();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-bold text-gradient">
            VOLTEDGE
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors border-b-2 ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary hover:border-primary/50"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Toggle Theme"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <NavLink
              to="/compare"
              title="Compare"
              className={({ isActive }) => `relative p-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <GitCompare className="h-5 w-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/favorites"
              title="Favorites"
              className={({ isActive }) => `relative p-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </NavLink>
            <button
              onClick={openCart}
              title="Cart"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <NavLink
              to={user && user.role !== "user" ? "/admin" : "/profile"}
              title={user && user.role !== "user" ? "Admin Dashboard" : "Profile"}
              className={({ isActive }) => `p-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <User className="h-5 w-5" />
            </NavLink>

            <Button
              variant="ghost"
              size="icon"
              title="Menu"
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-2 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
