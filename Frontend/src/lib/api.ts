import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import blogsData from "@/data/blogs.json";
import ordersData from "@/data/orders.json";
import faqsData from "@/data/faqs.json";
import teamData from "@/data/team.json";
import { apiFetch } from "./api-client";

export interface SpecDetail {
  name: string;
  value: string;
}

export interface SpecGroup {
  group: string;
  specs: SpecDetail[];
}

export interface Specification {
  id: string;
  _id?: string;
  details: SpecGroup[];
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  priceDiscount?: number;
  discountPercent?: number;
  originalPrice: number | null;
  category: any; 
  brand: string;
  image: string;
  imageCover?: string;
  images: string[];
  description: string;
  shortDescription?: string;
  specs: Record<string, string>;
  stock: number;
  featured: boolean;
  isFeatured?: boolean;
  isNew: boolean;
  createdAt?: string;
  tags: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  sold: number;
  specification?: Specification;
  status?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  image: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderTimeline {
  status: string;
  date: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  date: string;
  shippingAddress: string;
  trackingNumber: string | null;
  estimatedDelivery: string;
  timeline: OrderTimeline[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export type AdminUserRole = "user" | "admin";
export type AdminUserStatus = "active" | "suspended" | "pending";

export interface AdminUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  active: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface AdminUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalStaff: number;
  newUsersThisMonth: number;
}

export interface AdminUserEvent {
  id: string;
  type: string;
  title: string;
  time: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  analytics: AdminUserAnalytics;
  recentEvents: AdminUserEvent[];
}

const mapProduct = (p: any): Product => {
  const mapImage = (img: string | undefined) => {
    if (!img) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (img.startsWith('/')) return img;
    return `/img/products/${img}`;
  };

  return {
    ...p,
    id: p._id || p.id,
    image: mapImage(p.imageCover || p.image),
    imageCover: p.imageCover,
    images: Array.isArray(p.images) ? p.images.map(mapImage) : [],
    featured: p.isFeatured !== undefined ? p.isFeatured : p.featured,
    category: p.category, 
    originalPrice: p.priceDiscount ? p.price : null,
    price: p.finalPrice ?? p.price,
    specs: (() => {
      const flatSpecs = p.attributes ? { ...p.attributes } : (p.specs || {});
      if (p.specification && typeof p.specification === 'object' && p.specification.details) {
        p.specification.details.forEach((group: any) => {
          if (group.specs) {
            group.specs.forEach((spec: any) => {
              flatSpecs[spec.name] = spec.value;
            });
          }
        });
      }
      return flatSpecs;
    })(),
    specification: p.specification,
    ratingsAverage: p.ratingsAverage || 0,
    ratingsQuantity: p.ratingsQuantity || 0,
    sold: p.sold || 0,
    isNew: (() => {
      if (!p.createdAt) return p.isNew === true;
      const createdDate = new Date(p.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    })(),
    createdAt: p.createdAt,
  };
};

const mapOrder = (o: any): Order => ({
  id: o._id || o.id,
  userId: typeof o.user === 'object' ? o.user._id : o.user,
  user: typeof o.user === 'object' ? {
    name: o.user.name,
    email: o.user.email
  } : undefined,
  items: o.orderItems.map((i: any) => {
    const img = i.imageCover || i.image;
    const mappedImage = img && (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) 
      ? img 
      : img ? `/img/products/${img}` : '';

    return {
      productId: i.product,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: mappedImage,
    };
  }),
  total: o.totalPrice,
  status: o.orderStatus === 'pending' ? 'placed' : o.orderStatus,
  date: new Date(o.createdAt).toLocaleDateString(),
  shippingAddress: `${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.zip}`,
  trackingNumber: null,
  estimatedDelivery: o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : 'TBD',
  timeline: [],
});



const mapCategory = (c: any): Category => {
  const mapCategoryImage = (img: string | undefined, name: string) => {
    if (!img) {
      return `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&sig=${name}`;
    }
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (img.startsWith('/')) return img;
    return `/img/categories/${img}`;
  };

  return {
    ...c,
    id: c._id || c.id,
    icon: c.icon || "Laptop",
    count: c.count || 0,
    image: mapCategoryImage(c.image, c.name),
  };
};


const mapAdminUser = (user: any): AdminUser => ({
  ...user,
  id: user._id || user.id,
  phone: user.phone || "",
  photo: user.photo || "",
  permissions: Array.isArray(user.permissions) ? user.permissions : [],
  lastLogin: user.lastLogin || null,
});


// Products
export const fetchProducts = async (params: Record<string, string | number | boolean> = {}): Promise<{ products: Product[], total: number, page: number, limit: number }> => {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });
    
    const data = await apiFetch(`/api/v1/products?${query.toString()}`);
    return {
      products: data.data.data.map(mapProduct),
      total: data.total,
      page: data.page,
      limit: data.limit
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: productsData.map(mapProduct),
      total: productsData.length,
      page: 1,
      limit: productsData.length
    };
  }
};

export const fetchProductBySlug = async (
  slug: string,
): Promise<Product | undefined> => {
  try {
    const res = await apiFetch(`/api/v1/products?slug=${slug}`);
    if (res.data.data.length > 0) {
      return mapProduct(res.data.data[0]);
    }
    return undefined;
  } catch (error) {
    return productsData.find((p) => p.slug === slug) as Product | undefined;
  }
};

export const fetchProductById = async (
  id: string,
): Promise<Product | undefined> => {
  try {
    const res = await apiFetch(`/api/v1/products/${id}`);
    return mapProduct(res.data.data);
  } catch (error) {
    return (productsData as any[]).find((p) => p.id === id || p._id === id);
  }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const res = await apiFetch("/api/v1/products/featured");
    return res.data.products.map(mapProduct);
  } catch (error) {
    return (productsData as any[]).filter((p) => p.featured || p.isFeatured).map(mapProduct);
  }
};

export const fetchProductsByCategory = async (
  category: string,
): Promise<Product[]> => {
  const result = await fetchProducts({ category });
  return result.products;
};

export const createProduct = async (productData: any | FormData) => {
  const data = await apiFetch("/api/v1/products", {
    method: "POST",
    body: productData instanceof FormData ? productData : JSON.stringify(productData),
  });
  return mapProduct(data.data.data);
};

export const updateProduct = async (id: string, productData: any | FormData) => {
  const data = await apiFetch(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: productData instanceof FormData ? productData : JSON.stringify(productData),
  });
  return mapProduct(data.data.data);
};


export const deleteProduct = async (id: string) => {
  await apiFetch(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
};

export const createSpecification = async (specData: { product: string; details: SpecGroup[] }) => {
  const data = await apiFetch("/api/v1/specifications", {
    method: "POST",
    body: JSON.stringify(specData),
  });
  return data.data.data;
};

export const updateSpecification = async (id: string, specData: { details: SpecGroup[] }) => {
  const data = await apiFetch(`/api/v1/specifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(specData),
  });
  return data.data.data;
};

export const deleteSpecification = async (id: string) => {
  await apiFetch(`/api/v1/specifications/${id}`, {
    method: "DELETE",
  });
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await apiFetch("/api/v1/categories");
    return res.data.data.map(mapCategory);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return categoriesData.map(mapCategory);
  }
};

export const createCategory = async (categoryData: FormData) => {
  const data = await apiFetch("/api/v1/categories", {
    method: "POST",
    body: categoryData,
  });
  return mapCategory(data.data.data);
};

export const updateCategory = async (id: string, categoryData: FormData) => {
  const data = await apiFetch(`/api/v1/categories/${id}`, {
    method: "PATCH",
    body: categoryData,
  });
  return mapCategory(data.data.data);
};

export const deleteCategory = async (id: string) => {
  await apiFetch(`/api/v1/categories/${id}`, {
    method: "DELETE",
  });
};

// Reviews
export const fetchReviewsByProduct = async (productId: string, page = 1, limit = 10) => {
  try {
    const data = await apiFetch(`/api/v1/products/${productId}/reviews?page=${page}&limit=${limit}&sort=-createdAt`);
    return {
      reviews: data.data.data,
      total: data.total,
      page: data.page,
      limit: data.limit
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { reviews: [], total: 0, page, limit };
  }
};

export const createReview = async (productId: string, reviewData: { rating: number; review: string }) => {
  return await apiFetch(`/api/v1/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
};

export const updateReview = async (productId: string, reviewId: string, reviewData: { rating?: number; review?: string }) => {
  return await apiFetch(`/api/v1/products/${productId}/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(reviewData),
  });
};


// Blogs
export const fetchBlogs = async (): Promise<Blog[]> => {
  return blogsData as Blog[];
};

export const fetchBlogBySlug = async (
  slug: string,
): Promise<Blog | undefined> => {
  return (blogsData as Blog[]).find((b) => b.slug === slug);
};

// Orders
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const res = await apiFetch("/api/v1/orders");
    return res.data.data.map(mapOrder);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return ordersData as Order[];
  }
};

export const fetchOrderById = async (
  id: string,
): Promise<Order | undefined> => {
  try {
    const res = await apiFetch(`/api/v1/orders/${id}`);
    return mapOrder(res.data.data);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return (ordersData as Order[]).find((o) => o.id === id);
  }
};

export const createOrder = async (orderData: any) => {
  return await apiFetch("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const updateOrder = async (id: string, orderData: any) => {
  const data = await apiFetch(`/api/v1/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(orderData),
  });
  return mapOrder(data.data.data);
};


// FAQ
export const fetchFAQs = async (): Promise<FAQ[]> => {
  return faqsData as FAQ[];
};

// Team
export const fetchTeam = async (): Promise<TeamMember[]> => {
  return teamData as TeamMember[];
};

// Admin Stats
export const fetchOrderStats = async () => {
  const data = await apiFetch('/api/v1/orders/stats/overview');
  return data.data.stats;
};

export const fetchProductStats = async () => {
  const data = await apiFetch('/api/v1/products/stats');
  return data.data.stats;
};

export const fetchWishlistAnalytics = async () => {
  const data = await apiFetch('/api/v1/wishlist/analytics');
  return data.data.analytics;
};

export const fetchAdminDashboardData = async () => {
  const [orderStats, productStats, wishlistAnalytics, productsRes, orders, categories] = await Promise.all([
    fetchOrderStats(),
    fetchProductStats(),
    fetchWishlistAnalytics(),
    fetchProducts({ limit: 10, sort: '-sold' }),
    fetchOrders(),
    fetchCategories(),
  ]);

  return {
    orderStats,
    productStats,
    wishlistAnalytics,
    topProducts: productsRes.products,
    totalOrders: orders.length,
    totalProducts: productsRes.total,
    totalCategories: categories.length,
    recentOrders: orders.slice(0, 5),
    revenue: orders.reduce((acc, curr) => acc + curr.total, 0),
  };
};

export const fetchAdminUsers = async (
  params: Record<string, string | number | boolean> = {},
): Promise<AdminUsersResponse> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const data = await apiFetch(`/api/v1/users?${query.toString()}`);
  return {
    users: data.data.data.map(mapAdminUser),
    total: data.total,
    page: data.page,
    limit: data.limit,
    analytics: data.data.analytics,
    recentEvents: data.data.meta?.recentEvents || [],
  };
};

export const createAdminUser = async (payload: Record<string, unknown> | FormData) => {
  const data = await apiFetch("/api/v1/users", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });

  return mapAdminUser(data.data.data);
};

export const updateAdminUser = async (
  id: string,
  payload: Record<string, unknown> | FormData,
) => {
  const data = await apiFetch(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });

  return mapAdminUser(data.data.data);
};

export const deleteAdminUser = async (id: string) => {
  await apiFetch(`/api/v1/users/${id}`, {
    method: "DELETE",
  });
};

// ── Messages ──────────────────────────────────────────────────────────────────

export type MessageStatus = "unread" | "read" | "archived";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const submitContactForm = async (payload: ContactFormPayload) => {
  return await apiFetch("/api/v1/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchAdminMessages = async (params: Record<string, string | number> = {}): Promise<{ 
  messages: ContactMessage[]; 
  total: number; 
  page: number; 
  limit: number;
  countsByStatus: { unread: number; read: number; archived: number };
}> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const data = await apiFetch(`/api/v1/messages?${query.toString()}`);
  return {
    messages: data.data.data,
    total: data.total,
    page: data.page,
    limit: data.limit,
    countsByStatus: data.countsByStatus || { unread: 0, read: 0, archived: 0 },
  };
};

export const markMessageAsRead = async (id: string) => {
  return await apiFetch(`/api/v1/messages/${id}/read`, { method: "PATCH" });
};

export const archiveMessage = async (id: string) => {
  return await apiFetch(`/api/v1/messages/${id}/archive`, { method: "PATCH" });
};

export const deleteMessage = async (id: string) => {
  await apiFetch(`/api/v1/messages/${id}`, { method: "DELETE" });
};

export const getUnreadMessagesCount = async (): Promise<number> => {
  const data = await apiFetch("/api/v1/messages/unread-count");
  return data.data.count;
};

// ── CMS API Functions ─────────────────────────────────────────────────────────

// Site Settings
export interface SiteSettings {
  _id: string;
  siteName: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  workingHours: {
    day: string;
    hours: string;
    isOpen: boolean;
  }[];
  footerText?: string;
  copyrightText: string;
  updatedAt: string;
}

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const data = await apiFetch("/api/v1/settings");
  return data.data.data;
};

export const updateSiteSettings = async (settingsData: Partial<SiteSettings>) => {
  const data = await apiFetch("/api/v1/settings", {
    method: "PATCH",
    body: JSON.stringify(settingsData),
  });
  return data.data.data;
};

export const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);
  const data = await apiFetch("/api/v1/settings/logo", {
    method: "POST",
    body: formData,
  });
  return data.data.data;
};

export const uploadFavicon = async (file: File) => {
  const formData = new FormData();
  formData.append("favicon", file);
  const data = await apiFetch("/api/v1/settings/favicon", {
    method: "POST",
    body: formData,
  });
  return data.data.data;
};

// Hero Slides
export interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  const data = await apiFetch("/api/v1/hero-slides");
  return data.data.data;
};

export const fetchHeroSlidesAdmin = async (): Promise<HeroSlide[]> => {
  const data = await apiFetch("/api/v1/hero-slides/admin");
  return data.data.data;
};

export const createHeroSlide = async (slideData: FormData | Partial<HeroSlide>) => {
  const data = await apiFetch("/api/v1/hero-slides", {
    method: "POST",
    body: slideData instanceof FormData ? slideData : JSON.stringify(slideData),
  });
  return data.data.data;
};

export const updateHeroSlide = async (id: string, slideData: FormData | Partial<HeroSlide>) => {
  const data = await apiFetch(`/api/v1/hero-slides/${id}`, {
    method: "PATCH",
    body: slideData instanceof FormData ? slideData : JSON.stringify(slideData),
  });
  return data.data.data;
};

export const deleteHeroSlide = async (id: string) => {
  await apiFetch(`/api/v1/hero-slides/${id}`, {
    method: "DELETE",
  });
};

export const reorderHeroSlides = async (id: string, newOrder: number) => {
  const data = await apiFetch(`/api/v1/hero-slides/${id}/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ order: newOrder }),
  });
  return data.data.data;
};

// Features
export interface Feature {
  _id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export const fetchFeatures = async (): Promise<Feature[]> => {
  const data = await apiFetch("/api/v1/features");
  return data.data.data;
};

export const fetchFeaturesAdmin = async (): Promise<Feature[]> => {
  const data = await apiFetch("/api/v1/features/admin");
  return data.data.data;
};

export const createFeature = async (featureData: Partial<Feature>) => {
  const data = await apiFetch("/api/v1/features", {
    method: "POST",
    body: JSON.stringify(featureData),
  });
  return data.data.data;
};

export const updateFeature = async (id: string, featureData: Partial<Feature>) => {
  const data = await apiFetch(`/api/v1/features/${id}`, {
    method: "PATCH",
    body: JSON.stringify(featureData),
  });
  return data.data.data;
};

export const deleteFeature = async (id: string) => {
  await apiFetch(`/api/v1/features/${id}`, {
    method: "DELETE",
  });
};

// Page Content
export interface PageContentSection {
  key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: any[];
}

export interface PageContent {
  _id: string;
  page: string;
  sections: PageContentSection[];
  updatedBy?: string;
  updatedAt: string;
}

export const fetchPageContent = async (page: string): Promise<PageContent> => {
  const data = await apiFetch(`/api/v1/page-content/${page}`);
  return data.data.data;
};

export const updatePageContent = async (page: string, contentData: { sections: PageContentSection[] }) => {
  const data = await apiFetch(`/api/v1/page-content/${page}`, {
    method: "PATCH",
    body: JSON.stringify(contentData),
  });
  return data.data.data;
};

export const uploadSectionImage = async (page: string, sectionKey: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("sectionKey", sectionKey);
  const data = await apiFetch(`/api/v1/page-content/${page}/upload`, {
    method: "POST",
    body: formData,
  });
  return data.data.data;
};

// FAQs (Update existing)
export interface FAQExtended extends FAQ {
  _id: string;
  order: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export const fetchFAQsFromAPI = async (): Promise<FAQExtended[]> => {
  const data = await apiFetch("/api/v1/faqs");
  return data.data.data;
};

export const fetchFAQsAdmin = async (): Promise<FAQExtended[]> => {
  const data = await apiFetch("/api/v1/faqs/admin");
  return data.data.data;
};

export const createFAQ = async (faqData: Partial<FAQExtended>) => {
  const data = await apiFetch("/api/v1/faqs", {
    method: "POST",
    body: JSON.stringify(faqData),
  });
  return data.data.data;
};

export const updateFAQ = async (id: string, faqData: Partial<FAQExtended>) => {
  const data = await apiFetch(`/api/v1/faqs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(faqData),
  });
  return data.data.data;
};

export const deleteFAQ = async (id: string) => {
  await apiFetch(`/api/v1/faqs/${id}`, {
    method: "DELETE",
  });
};

// Social Links
export interface SocialLink {
  _id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const fetchSocialLinks = async (): Promise<SocialLink[]> => {
  const data = await apiFetch("/api/v1/social-links");
  return data.data.data;
};

export const createSocialLink = async (linkData: Partial<SocialLink>) => {
  const data = await apiFetch("/api/v1/social-links", {
    method: "POST",
    body: JSON.stringify(linkData),
  });
  return data.data.data;
};

export const updateSocialLink = async (id: string, linkData: Partial<SocialLink>) => {
  const data = await apiFetch(`/api/v1/social-links/${id}`, {
    method: "PATCH",
    body: JSON.stringify(linkData),
  });
  return data.data.data;
};

export const deleteSocialLink = async (id: string) => {
  await apiFetch(`/api/v1/social-links/${id}`, {
    method: "DELETE",
  });
};

// SEO Settings
export interface SEOSettings {
  _id: string;
  page: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  updatedAt: string;
}

export const fetchSEOSettings = async (page: string): Promise<SEOSettings> => {
  const data = await apiFetch(`/api/v1/seo-settings/${page}`);
  return data.data.data;
};

export const updateSEOSettings = async (page: string, seoData: Partial<SEOSettings>) => {
  const data = await apiFetch(`/api/v1/seo-settings/${page}`, {
    method: "PATCH",
    body: JSON.stringify(seoData),
  });
  return data.data.data;
};

export const uploadOGImage = async (page: string, file: File) => {
  const formData = new FormData();
  formData.append("ogImage", file);
  const data = await apiFetch(`/api/v1/seo-settings/${page}/og-image`, {
    method: "POST",
    body: formData,
  });
  return data.data.data;
};
