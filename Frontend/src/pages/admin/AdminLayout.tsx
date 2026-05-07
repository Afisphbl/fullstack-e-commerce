import React, { useState } from "react";
import { Link, NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
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
  Bell,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/categories", icon: Tag, label: "Categories" },
  { to: "/admin/pos", icon: Monitor, label: "POS" },
  { to: "/admin/summary", icon: BarChart3, label: "Summary" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
  "/admin/categories": "Categories",
  "/admin/pos": "POS",
  "/admin/summary": "Summary",
  "/admin/settings": "Settings",
};

const AdminLayout = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/v1/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.setQueryData(["currentUser"], null);
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const currentTitle = pageTitles[location.pathname] || "Admin";

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,#dfe9ff_0%,transparent_28%),hsl(var(--background))]">
      <aside
        className={`${collapsed ? "w-20" : "w-72"} sticky top-0 h-screen border-r border-border/70 bg-card/95 backdrop-blur flex flex-col transition-all duration-300`}
      >
        <div className="border-b border-border/70 p-5">
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
            <p className="mt-1 text-xs text-muted-foreground">Commerce Control Center</p>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-2xl px-3 py-3 text-sm transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4" /> {!collapsed && label}
              </NavLink>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-border/70 p-4">
          <div
            className={`flex items-center rounded-2xl bg-muted/40 ${collapsed ? "justify-center" : "gap-3"} px-3 py-3`}
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
                className="flex-1 rounded-xl text-muted-foreground"
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
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className={`${collapsed ? "w-full" : "flex-1"} rounded-xl text-destructive hover:text-destructive`}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <h1 className="text-xl font-display font-semibold text-foreground">
              {currentTitle}
            </h1>
            <div className="flex items-center gap-3">
              <div className="relative w-64 max-w-[48vw]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Global search..."
                  className="h-11 rounded-2xl border-border/70 bg-card pl-9"
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-2xl" title="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-2xl">
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <div className="hidden items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2 md:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user?.name?.[0]}
                </div>
                <div className="max-w-[160px]">
                  <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
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
