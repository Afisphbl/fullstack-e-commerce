import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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

// ── Admin pages (lazy-loaded — only downloaded when an admin visits /admin) ───
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminCategoriesPage = lazy(
  () => import("./pages/admin/AdminCategoriesPage"),
);
const AdminPOSPage = lazy(() => import("./pages/admin/AdminPOSPage"));
const AdminSummaryPage = lazy(() => import("./pages/admin/AdminSummaryPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 seconds — prevents refetch on every component mount
    },
  },
});

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <LoadingSpinner
          size='lg'
          label='Authenticating and loading your admin dashboard...'
        />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdminRole(user.role)) {
    return <Navigate to='/login' replace />;
  }
  // Prevent suspended admins from accessing admin pages
  if (user.status === "suspended") {
    return <Navigate to='/login' replace />;
  }
  return <>{children}</>;
};

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => (
  <div className='flex flex-col min-h-screen'>
    <Header />
    <main className='flex-1' aria-label='Main content'>
      {children}
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
                    <Suspense
                      fallback={
                        <div className='flex min-h-screen items-center justify-center bg-background'>
                          <LoadingSpinner size='lg' label='Loading page...' />
                        </div>
                      }
                    >
                      <Routes>
                        {/* Storefront */}
                        <Route
                          path='/login'
                          element={
                            <StorefrontLayout>
                              <Login />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/signup'
                          element={
                            <StorefrontLayout>
                              <Signup />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/forgot-password'
                          element={
                            <StorefrontLayout>
                              <ForgotPassword />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/reset-password/:token'
                          element={
                            <StorefrontLayout>
                              <ResetPassword />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/'
                          element={
                            <StorefrontLayout>
                              <Index />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/shop'
                          element={
                            <StorefrontLayout>
                              <ShopPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/product/:slug'
                          element={
                            <StorefrontLayout>
                              <ProductDetailPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/checkout'
                          element={
                            <StorefrontLayout>
                              <CheckoutPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/blog'
                          element={
                            <StorefrontLayout>
                              <BlogPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/blog/:slug'
                          element={
                            <StorefrontLayout>
                              <BlogDetailPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/about'
                          element={
                            <StorefrontLayout>
                              <AboutPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/contact'
                          element={
                            <StorefrontLayout>
                              <ContactPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/faq'
                          element={
                            <StorefrontLayout>
                              <FAQPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/compare'
                          element={
                            <StorefrontLayout>
                              <ComparePage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/favorites'
                          element={
                            <StorefrontLayout>
                              <FavoritesPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/profile'
                          element={
                            <StorefrontLayout>
                              <ProfilePage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/orders'
                          element={
                            <StorefrontLayout>
                              <OrdersPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/orders/:id'
                          element={
                            <StorefrontLayout>
                              <OrderDetailPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/payment/success/:orderId'
                          element={
                            <StorefrontLayout>
                              <PaymentSuccessPage />
                            </StorefrontLayout>
                          }
                        />
                        <Route
                          path='/track/:id'
                          element={
                            <StorefrontLayout>
                              <TrackOrderPage />
                            </StorefrontLayout>
                          }
                        />

                        {/* Admin */}
                        <Route
                          path='/admin'
                          element={
                            <AdminRoute>
                              <AdminLayout />
                            </AdminRoute>
                          }
                        >
                          <Route index element={<AdminDashboard />} />
                          <Route
                            path='products'
                            element={<AdminProductsPage />}
                          />
                          <Route path='orders' element={<AdminOrdersPage />} />
                          <Route path='users' element={<AdminUsersPage />} />
                          <Route
                            path='categories'
                            element={<AdminCategoriesPage />}
                          />
                          <Route path='pos' element={<AdminPOSPage />} />
                          <Route
                            path='summary'
                            element={<AdminSummaryPage />}
                          />
                          <Route
                            path='settings'
                            element={<AdminSettingsPage />}
                          />
                          <Route
                            path='messages'
                            element={<AdminMessagesPage />}
                          />
                        </Route>

                        <Route path='*' element={<NotFound />} />
                      </Routes>
                    </Suspense>
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
