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
import { isAdminRole } from "@/lib/roles";

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

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Toggle Theme"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary h-9 w-9"
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
              <GitCompare className="h-4 w-4 sm:h-5 sm:w-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/favorites"
              title="Favorites"
              className={({ isActive }) => `relative p-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
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
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <NavLink
              to={user ? (isAdminRole(user.role) ? "/admin" : "/profile") : "/login"}
              title={user ? (isAdminRole(user.role) ? "Admin Dashboard" : "Profile") : "Login / Register"}
              className={({ isActive }) => 
                `flex items-center gap-1 sm:gap-2 p-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`
              }
            >
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full overflow-hidden border border-primary/20 bg-muted">
                    {user.photo && user.photo !== 'default.jpg' ? (
                      <img 
                        src={user.photo} 
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </NavLink>


            <Button
              variant="ghost"
              size="icon"
              title="Menu"
              className="md:hidden text-muted-foreground h-9 w-9"
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
