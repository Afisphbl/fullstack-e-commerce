import React, { useState } from "react";
import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  BarChart3,
  Monitor,
  LogOut,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Search,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/categories", icon: Tag, label: "Categories" },
  { to: "/admin/pos", icon: Monitor, label: "POS" },
  { to: "/admin/summary", icon: BarChart3, label: "Summary" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/categories": "Categories",
  "/admin/pos": "POS",
  "/admin/summary": "Summary",
  "/admin/settings": "Settings",
};

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const currentTitle = pageTitles[location.pathname] || "Admin";

  return (
    <div className="min-h-screen flex bg-background">
      <aside
        className={`${collapsed ? "w-20" : "w-64"} sticky top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/admin"
              className="font-display text-lg font-bold text-gradient"
            >
              {collapsed ? "VE" : "VOLTEDGE"}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((v) => !v)}
              className="text-muted-foreground"
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!collapsed && (
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4" /> {!collapsed && label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-2`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {user?.name?.[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 text-muted-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={`${collapsed ? "w-full" : "flex-1"} text-destructive hover:text-destructive`}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <h1 className="text-xl font-display font-semibold text-foreground">
              {currentTitle}
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative w-64 max-w-[55vw]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Global search..."
                  className="h-9 bg-card pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
