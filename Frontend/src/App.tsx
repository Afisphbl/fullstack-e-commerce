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
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ComparePage from "./pages/ComparePage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminPOSPage from "./pages/admin/AdminPOSPage";
import AdminSummaryPage from "./pages/admin/AdminSummaryPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { isAdminRole } from "@/lib/roles";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const queryClient = new QueryClient();



const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Authenticating and loading your admin dashboard..." />
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

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">{children}</main>
    <CartDrawer />
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <CartProvider>
          <FavoritesProvider>
            <CompareProvider>
              <Toaster />
              <SonnerToaster />
              <BrowserRouter>
                  <Routes>
                    {/* Storefront */}
                    <Route
                      path="/login"
                      element={
                        <StorefrontLayout>
                          <Login />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/signup"
                      element={
                        <StorefrontLayout>
                          <Signup />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <StorefrontLayout>
                          <ForgotPassword />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/reset-password/:token"
                      element={
                        <StorefrontLayout>
                          <ResetPassword />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <StorefrontLayout>
                          <Index />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/shop"
                      element={
                        <StorefrontLayout>
                          <ShopPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/product/:slug"
                      element={
                        <StorefrontLayout>
                          <ProductDetailPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <StorefrontLayout>
                          <CheckoutPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/blog"
                      element={
                        <StorefrontLayout>
                          <BlogPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/blog/:slug"
                      element={
                        <StorefrontLayout>
                          <BlogDetailPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/about"
                      element={
                        <StorefrontLayout>
                          <AboutPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/contact"
                      element={
                        <StorefrontLayout>
                          <ContactPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/faq"
                      element={
                        <StorefrontLayout>
                          <FAQPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/compare"
                      element={
                        <StorefrontLayout>
                          <ComparePage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/favorites"
                      element={
                        <StorefrontLayout>
                          <FavoritesPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <StorefrontLayout>
                          <ProfilePage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <StorefrontLayout>
                          <OrdersPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <StorefrontLayout>
                          <OrderDetailPage />
                        </StorefrontLayout>
                      }
                    />
                    <Route
                      path="/track/:id"
                      element={
                        <StorefrontLayout>
                          <TrackOrderPage />
                        </StorefrontLayout>
                      }
                    />

                    {/* Admin */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route
                        path="categories"
                        element={<AdminCategoriesPage />}
                      />
                      <Route path="pos" element={<AdminPOSPage />} />
                      <Route path="summary" element={<AdminSummaryPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
            </CompareProvider>
          </FavoritesProvider>
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
