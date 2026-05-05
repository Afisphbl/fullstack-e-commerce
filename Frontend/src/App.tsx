import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
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
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminPOSPage from "./pages/admin/AdminPOSPage";
import AdminSummaryPage from "./pages/admin/AdminSummaryPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <AdminLoginPage />;
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
    <ThemeProvider>
      <TooltipProvider>
        <CartProvider>
          <FavoritesProvider>
            <CompareProvider>
              <AdminAuthProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    {/* Storefront */}
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
              </AdminAuthProvider>
            </CompareProvider>
          </FavoritesProvider>
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
