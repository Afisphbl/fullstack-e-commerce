import { useState, Suspense } from "react";
import {
  Link,
  NavLink,
  useLocation,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiFetch, removeAuthToken } from "@/lib/api-client";
import { getUnreadMessagesCount } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Monitor,
  LogOut,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Bell,
  MessageSquare,
  Globe,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";

const AdminLayout = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation("admin");

  // Get localized company name
  const localizedCompanyName = useLocalizedField(settings.companyName);

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/admin/products", icon: Package, label: t("products") },
    { to: "/admin/orders", icon: ShoppingCart, label: t("orders") },
    { to: "/admin/users", icon: Users, label: t("users") },
    { to: "/admin/pos", icon: Monitor, label: t("pos") },
    { to: "/admin/summary", icon: BarChart3, label: t("summary") },
    { to: "/admin/messages", icon: MessageSquare, label: t("messages") },
    { to: "/admin/settings", icon: Settings, label: t("settings") },
  ];

  const pageTitles: Record<string, string> = {
    "/admin": t("dashboard"),
    "/admin/products": t("products"),
    "/admin/orders": t("orders"),
    "/admin/users": t("users"),
    "/admin/pos": t("pos"),
    "/admin/summary": t("summary"),
    "/admin/messages": t("messages"),
    "/admin/settings": t("settings"),
  };

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadMessagesCount"],
    queryFn: getUnreadMessagesCount,
    refetchInterval: 30000, // Check every 30s
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/v1/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      // Remove the token from localStorage
      removeAuthToken();
      toast.success(t("loggedOutSuccess"));
      // Clear all user-related data from cache
      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["wishlist"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const currentTitle = pageTitles[location.pathname] || t("dashboard");

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,#dfe9ff_0%,transparent_28%),hsl(var(--background))] w-full">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-20" : "w-72"} ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 h-[100dvh] border-r border-border/70 bg-card/95 backdrop-blur flex flex-col transition-all duration-300 z-50`}
      >
        <div className="border-b border-border/70 p-5">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/admin"
              className="font-display text-lg font-bold text-gradient uppercase"
            >
              {collapsed
                ? localizedCompanyName
                    .split(/\s+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                : localizedCompanyName}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((v) => !v)}
              className="text-muted-foreground hidden lg:flex"
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!collapsed && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("commerceControlCenter")}
            </p>
          )}
        </div>
        <nav className="flex-1 min-h-0 space-y-1 p-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isMessages = to === "/admin/messages";
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center relative ${collapsed ? "justify-center" : "gap-3"} rounded-2xl px-3 py-3 text-sm transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {isMessages && unreadCount > 0 && (
                  <span
                    className={`absolute flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ${collapsed ? "-right-1 -top-1" : "right-3"}`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-border/70 p-4">
          <div
            className={`flex items-center rounded-2xl bg-muted/40 ${collapsed ? "justify-center" : "gap-3"} px-3 py-3`}
          >
            {user?.photo && user.photo !== "default.jpg" ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
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

      <main className="flex-1 min-w-0 w-full lg:w-auto">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                {currentTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-2xl h-9 w-9 sm:h-10 sm:w-10 text-primary hover:text-primary"
                title={t("viewStore")}
              >
                <Globe className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-2xl h-9 w-9 sm:h-10 sm:w-10"
                title={t("notifications")}
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-2xl h-9 w-9 sm:h-10 sm:w-10"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <div className="hidden md:flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2">
                {user?.photo && user.photo !== "default.jpg" ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="max-w-[160px]">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          <Suspense
            fallback={
              <div className="flex h-[60vh] items-center justify-center">
                <LoadingSpinner size="lg" label={t("loadingDashboard")} />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
