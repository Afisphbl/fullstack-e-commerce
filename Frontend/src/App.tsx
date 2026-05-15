import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { isAdminRole } from "@/lib/roles";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SEOHead } from "@/components/shared/SEOHead";
import Index from "./pages/Index";

// ── Storefront pages (lazy-loaded for code splitting) ─────────────────────────
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// ── Admin pages ──────────────────────────────────────────────────────────────
import AdminLayout from "./pages/admin/AdminLayout";
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminCategoriesPage = lazy(
  () => import("./pages/admin/AdminCategoriesPage")
);
const AdminPOSPage = lazy(() => import("./pages/admin/AdminPOSPage"));
const AdminSummaryPage = lazy(() => import("./pages/admin/AdminSummaryPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: data is served instantly from cache, then
      // re-fetched silently in the background after the staleTime expires.
      staleTime: 5 * 60 * 1_000, // 5 minutes — covers most browsing sessions
      gcTime: 10 * 60 * 1_000, // 10 minutes — cache stays in memory longer
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx client errors (auth, not-found, etc.)
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2; // Retry network/server errors up to 2 times
      },
      refetchOnWindowFocus: true,
    },
  },
});

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner
          size="lg"
          label="Authenticating and loading your admin dashboard..."
        />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdminRole(user.role)) {
    return <Navigate to="/login" replace />;
  }
  // Prevent suspended admins from accessing admin pages
  if (user.status === "suspended") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const StorefrontLayout = () => (
  <div className="flex flex-col min-h-screen">
    {/* Skip to main content — accessibility for keyboard / screen-reader users */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:shadow-lg"
    >
      Skip to main content
    </a>
    <SEOHead />
    <Header />
    <main id="main-content" className="flex-1" aria-label="Main content">
      <Suspense
        fallback={
          <div className="flex flex-1 min-h-[50vh] items-center justify-center bg-background">
            <LoadingSpinner size="lg" label="Loading page content..." />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </main>
    <CartDrawer />
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <SiteSettingsProvider>
            <CartProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <Toaster />
                  <SonnerToaster />
                  <BrowserRouter>
                    <Routes>
                      {/* Auth Pages (No Header/Footer) */}
                      <Route
                        path="/login"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Login />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/signup"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Signup />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/forgot-password"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ForgotPassword />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/reset-password/:token"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ResetPassword />
                          </Suspense>
                        }
                      />

                      {/* Storefront Pages (Persistent Layout) */}
                      <Route element={<StorefrontLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route
                          path="/product/:slug"
                          element={<ProductDetailPage />}
                        />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route
                          path="/blog/:slug"
                          element={<BlogDetailPage />}
                        />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/compare" element={<ComparePage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route
                          path="/orders/:id"
                          element={<OrderDetailPage />}
                        />
                        <Route
                          path="/payment/success/:orderId"
                          element={<PaymentSuccessPage />}
                        />
                        <Route path="/track/:id" element={<TrackOrderPage />} />
                      </Route>

                      {/* Admin Pages (Persistent Sidebar) */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route
                          path="products"
                          element={<AdminProductsPage />}
                        />
                        <Route path="orders" element={<AdminOrdersPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route
                          path="categories"
                          element={<AdminCategoriesPage />}
                        />
                        <Route path="pos" element={<AdminPOSPage />} />
                        <Route path="summary" element={<AdminSummaryPage />} />
                        <Route
                          path="settings"
                          element={<AdminSettingsPage />}
                        />
                        <Route
                          path="messages"
                          element={<AdminMessagesPage />}
                        />
                      </Route>

                      <Route element={<StorefrontLayout />}>
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </CompareProvider>
              </FavoritesProvider>
            </CartProvider>
          </SiteSettingsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
