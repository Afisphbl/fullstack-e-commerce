// Data endpoints now enforce strict backend calls with empty array fallbacks.
import { apiFetch } from "./api-client";
import {
  User,
  ApiResponse,
  AuthResponse,
  ProfileResponse,
  UploadResponse,
  AdminUserEvent,
  Address,
  SpecDetail,
  SpecGroup,
  Specification,
  Product,
  Order,
  Category,
  ProductStatus,
  AdminDashboardData,
  Blog,
  FAQ,
  TeamMember,
  WishlistAnalytics,
  MessageResponse,
  Review,
} from "@/types/api";

export type {
  User,
  ApiResponse,
  AuthResponse,
  ProfileResponse,
  UploadResponse,
  AdminUserEvent,
  Address,
  SpecDetail,
  SpecGroup,
  Specification,
  Product,
  Order,
  Category,
  ProductStatus,
  AdminDashboardData,
  Blog,
  FAQ,
  TeamMember,
  WishlistAnalytics,
  MessageResponse,
  Review,
};

export interface RawProduct {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  priceDiscount?: number;
  imageCover?: string;
  image?: string;
  images?: string[];
  isFeatured?: boolean;
  featured?: boolean;
  category: Category | string | null;
  attributes?: Record<string, string>;
  specs?: Record<string, string>;
  specification?: Specification;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  sold?: number;
  createdAt?: string;
  isNew?: boolean;
  finalPrice?: number;
  brand?: string;
  description?: string;
  stock?: number;
  tags?: string[];
  status?: ProductStatus;
  originalPrice?: number | null;
  totalRevenue?: number;
}

export interface RawCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  count?: number;
  image?: string;
}

export interface RawOrder {
  _id: string;
  id?: string;
  user: string | { _id: string; name: string; email: string };
  orderItems: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    imageCover?: string;
  }>;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    zip: string;
  };
  deliveredAt?: string;
}

export interface RawAdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  active: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
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

export interface RawReview {
  _id: string;
  user:
    | {
        _id: string;
        name: string;
        photo?: string;
      }
    | string;
  product: string;
  review: string;
  rating: number;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  analytics: AdminUserAnalytics;
  recentEvents: AdminUserEvent[];
}

export const mapProduct = (p: RawProduct): Product => {
  const mapImage = (img: string | undefined): string => {
    if (!img)
      return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.startsWith("/")) return img;
    return `/img/products/${img}`;
  };

  return {
    ...p,
    id: p._id || p.id || "",
    image: mapImage(p.imageCover || p.image),
    imageCover: p.imageCover,
    images: Array.isArray(p.images) ? p.images.map(mapImage) : [],
    featured: p.isFeatured !== undefined ? p.isFeatured : p.featured || false,
    category: p.category,
    originalPrice: p.originalPrice ?? (p.priceDiscount ? p.price : null),
    price: p.finalPrice ?? p.price,
    specs: (() => {
      const flatSpecs: Record<string, string> = p.attributes
        ? { ...p.attributes }
        : p.specs || {};
      if (
        p.specification &&
        typeof p.specification === "object" &&
        p.specification.details
      ) {
        p.specification.details.forEach((group) => {
          if (group.specs) {
            group.specs.forEach((spec) => {
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
    brand: p.brand || "",
    description: p.description || "",
    stock: p.stock || 0,
    tags: p.tags || [],
  };
};

const mapOrder = (o: RawOrder): Order => ({
  id: o._id || o.id || "",
  userId: typeof o.user === "object" ? o.user._id : o.user,
  user:
    typeof o.user === "object"
      ? {
          name: o.user.name,
          email: o.user.email,
        }
      : undefined,
  items: o.orderItems.map((i) => {
    const img = i.imageCover || i.image;
    const mappedImage =
      img &&
      (img.startsWith("http") || img.startsWith("data:") || img.startsWith("/"))
        ? img
        : img
          ? `/img/products/${img}`
          : "";

    return {
      productId: i.product,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: mappedImage,
    };
  }),
  total: o.totalPrice,
  status: o.orderStatus === "pending" ? "placed" : o.orderStatus,
  date: new Date(o.createdAt).toLocaleDateString(),
  shippingAddress: `${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.zip}`,
  trackingNumber: null,
  estimatedDelivery: o.deliveredAt
    ? new Date(o.deliveredAt).toLocaleDateString()
    : "TBD",
  timeline: [],
});

const mapCategory = (c: RawCategory): Category => {
  const mapCategoryImage = (img: string | undefined, name: string): string => {
    if (!img) {
      return `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&sig=${name}`;
    }
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.startsWith("/")) return img;
    return `/img/categories/${img}`;
  };

  return {
    ...c,
    id: c._id || c.id || "",
    name: c.name || "",
    slug: c.slug || "",
    icon: c.icon || "Laptop",
    count: c.count || 0,
    image: mapCategoryImage(c.image, c.name || ""),
  };
};

const mapAdminUser = (user: RawAdminUser): AdminUser => ({
  ...user,
  id: user._id || user.id || "",
  phone: user.phone || "",
  photo: user.photo || "",
  permissions: Array.isArray(user.permissions) ? user.permissions : [],
  lastLogin: user.lastLogin || null,
});

const mapReview = (r: RawReview): Review => ({
  id: r._id,
  _id: r._id,
  rating: r.rating,
  review: r.review,
  createdAt: r.createdAt,
  user:
    typeof r.user === "object"
      ? {
          _id: r.user._id,
          name: r.user.name,
          photo: r.user.photo,
        }
      : undefined,
});

// Products
export const fetchProducts = async (
  params: Record<string, string | number | boolean> = {}
): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const data = await apiFetch<ApiResponse<RawProduct[]>>(
      `/api/v1/products?${query.toString()}`
    );
    return {
      products: data.data.data.map(mapProduct),
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  }
};

export const fetchProductBySlug = async (
  slug: string
): Promise<Product | undefined> => {
  try {
    const res = await apiFetch<ApiResponse<RawProduct[]>>(
      `/api/v1/products?slug=${slug}`
    );
    const products = res.data.data;
    if (products && products.length > 0 && products[0]) {
      return mapProduct(products[0]);
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const fetchProductById = async (
  id: string
): Promise<Product | undefined> => {
  try {
    const res = await apiFetch<ApiResponse<RawProduct>>(
      `/api/v1/products/${id}`
    );
    return mapProduct(res.data.data);
  } catch (error) {
    return undefined;
  }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const res = await apiFetch<ApiResponse<{ products: RawProduct[] }>>(
      "/api/v1/products/featured"
    );
    return res.data.data.products.map(mapProduct);
  } catch (error) {
    return [];
  }
};

export const fetchProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  const result = await fetchProducts({ category });
  return result.products;
};

export const createProduct = async (
  productData: Record<string, unknown> | FormData
) => {
  const data = await apiFetch<ApiResponse<RawProduct>>("/api/v1/products", {
    method: "POST",
    body:
      productData instanceof FormData
        ? productData
        : JSON.stringify(productData),
  });
  return mapProduct(data.data.data);
};

export const updateProduct = async (
  id: string,
  productData: Record<string, unknown> | FormData
) => {
  const data = await apiFetch<ApiResponse<RawProduct>>(
    `/api/v1/products/${id}`,
    {
      method: "PATCH",
      body:
        productData instanceof FormData
          ? productData
          : JSON.stringify(productData),
    }
  );
  return mapProduct(data.data.data);
};

export const deleteProduct = async (id: string) => {
  await apiFetch(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
};

export const createSpecification = async (specData: {
  product: string;
  details: SpecGroup[];
}) => {
  const data = await apiFetch<ApiResponse<Specification>>(
    "/api/v1/specifications",
    {
      method: "POST",
      body: JSON.stringify(specData),
    }
  );
  return data.data.data;
};

export const updateSpecification = async (
  id: string,
  specData: { details: SpecGroup[] }
) => {
  const data = await apiFetch<ApiResponse<Specification>>(
    `/api/v1/specifications/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(specData),
    }
  );
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
    const res =
      await apiFetch<ApiResponse<RawCategory[]>>("/api/v1/categories");
    return res.data.data.map(mapCategory);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

export const createCategory = async (categoryData: FormData) => {
  const data = await apiFetch<ApiResponse<RawCategory>>("/api/v1/categories", {
    method: "POST",
    body: categoryData,
  });
  return mapCategory(data.data.data);
};

export const updateCategory = async (id: string, categoryData: FormData) => {
  const data = await apiFetch<ApiResponse<RawCategory>>(
    `/api/v1/categories/${id}`,
    {
      method: "PATCH",
      body: categoryData,
    }
  );
  return mapCategory(data.data.data);
};

export const deleteCategory = async (id: string) => {
  await apiFetch(`/api/v1/categories/${id}`, {
    method: "DELETE",
  });
};

// Reviews
export const fetchReviewsByProduct = async (
  productId: string,
  page = 1,
  limit = 10
): Promise<{
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const data = await apiFetch<ApiResponse<RawReview[]>>(
      `/api/v1/products/${productId}/reviews?page=${page}&limit=${limit}&sort=-createdAt`
    );
    return {
      reviews: data.data.data.map(mapReview),
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { reviews: [], total: 0, page, limit };
  }
};

export const createReview = async (
  productId: string,
  reviewData: { rating: number; review: string }
) => {
  return await apiFetch<ApiResponse<RawReview>>(
    `/api/v1/products/${productId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(reviewData),
    }
  );
};

export const updateReview = async (
  productId: string,
  reviewId: string,
  reviewData: { rating?: number; review?: string }
) => {
  return await apiFetch<ApiResponse<RawReview>>(
    `/api/v1/products/${productId}/reviews/${reviewId}`,
    {
      method: "PATCH",
      body: JSON.stringify(reviewData),
    }
  );
};

// Blogs
export const fetchBlogs = async (): Promise<Blog[]> => {
  // Coming soon - disabled fetch
  return [];
};

export const fetchBlogBySlug = async (
  slug: string
): Promise<Blog | undefined> => {
  try {
    const res = await apiFetch<ApiResponse<Blog>>(`/api/v1/blogs/${slug}`);
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch blog by slug:", err);
    return undefined;
  }
};

// Orders
export const fetchOrders = async (): Promise<Order[]> => {
  const res = await apiFetch<ApiResponse<RawOrder[]>>("/api/v1/orders");
  return res.data.data.map(mapOrder);
};

export const fetchOrderById = async (
  id: string
): Promise<Order | undefined> => {
  const res = await apiFetch<ApiResponse<RawOrder>>(`/api/v1/orders/${id}`);
  return mapOrder(res.data.data);
};

export const createOrder = async (orderData: Record<string, unknown>) => {
  return await apiFetch<ApiResponse<RawOrder>>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const updateOrder = async (
  id: string,
  orderData: Record<string, unknown>
) => {
  const data = await apiFetch<ApiResponse<RawOrder>>(`/api/v1/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(orderData),
  });
  return mapOrder(data.data.data);
};

// FAQ
export const fetchFAQs = async (): Promise<FAQ[]> => {
  // Coming soon - disabled fetch
  return [];
};

// Settings
export const fetchGeneralSettings = async () => {
  const data = await apiFetch<{ data: { data: Record<string, unknown> } }>(
    "/api/v1/settings/general"
  );
  return data.data.data;
};

// Locations
export const fetchEthiopianCities = async (): Promise<string[]> => {
  try {
    const data = await apiFetch<{ status: string; data: string[] }>(
      "/api/v1/settings/cities"
    );
    return data.data;
  } catch (error) {
    console.error("Failed to fetch cities", error);
    return [];
  }
};

// Team
export const fetchTeam = async (): Promise<TeamMember[]> => {
  try {
    const res = await apiFetch<ApiResponse<TeamMember[]>>("/api/v1/team");
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch team:", err);
    return [];
  }
};

// Admin Stats
export const fetchOrderStats = async () => {
  const data = await apiFetch<{
    data: {
      data?: { stats: Record<string, unknown> };
      stats?: Record<string, unknown>;
    };
  }>("/api/v1/orders/stats/overview");
  // Handle inconsistent nesting: data.data.stats or data.data.data.stats
  return data.data?.data?.stats || data.data?.stats || {};
};

export const fetchProductStats = async () => {
  const data = await apiFetch<{
    data: {
      data?: { stats: Record<string, unknown> };
      stats?: Record<string, unknown>;
    };
  }>("/api/v1/products/stats");
  // Handle inconsistent nesting
  return data.data?.data?.stats || data.data?.stats || {};
};

export const fetchWishlistAnalytics = async (): Promise<WishlistAnalytics> => {
  const data = await apiFetch<{
    data: {
      data?: { analytics: WishlistAnalytics };
      analytics?: WishlistAnalytics;
    };
  }>("/api/v1/wishlist/analytics");
  // Handle inconsistent nesting
  return (
    data.data?.data?.analytics ||
    data.data?.analytics || {
      topWishlistedProducts: [],
      stats: { totalWishlistItems: 0, avgWishlistSize: 0 },
    }
  );
};

export const fetchAdminDashboardData =
  async (): Promise<AdminDashboardData> => {
    interface DashboardRawResponse extends Omit<
      AdminDashboardData,
      "topProducts" | "recentOrders"
    > {
      topProducts: RawProduct[];
      recentOrders: RawOrder[];
    }
    const res =
      await apiFetch<ApiResponse<DashboardRawResponse>>("/api/v1/dashboard");
    const data = res.data.data;

    return {
      ...data,
      topProducts: (data.topProducts || []).map(mapProduct),
      recentOrders: (data.recentOrders || []).map(mapOrder),
    };
  };

export const fetchAdminUsers = async (
  params: Record<string, string | number | boolean> = {}
): Promise<AdminUsersResponse> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const data = await apiFetch<ApiResponse<RawAdminUser[]>>(
    `/api/v1/users?${query.toString()}`
  );
  const responseData = data.data as unknown as {
    data: RawAdminUser[];
    analytics: AdminUserAnalytics;
    meta?: { recentEvents: AdminUserEvent[] };
  };

  return {
    users: responseData.data.map(mapAdminUser),
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 10,
    analytics: responseData.analytics,
    recentEvents: responseData.meta?.recentEvents || [],
  };
};

export const createAdminUser = async (
  payload: Record<string, unknown> | FormData
) => {
  const data = await apiFetch<ApiResponse<RawAdminUser>>("/api/v1/users", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });

  return mapAdminUser(data.data.data);
};

export const updateAdminUser = async (
  id: string,
  payload: Record<string, unknown> | FormData
) => {
  const data = await apiFetch<ApiResponse<RawAdminUser>>(
    `/api/v1/users/${id}`,
    {
      method: "PATCH",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }
  );

  return mapAdminUser(data.data.data);
};

export const deleteAdminUser = async (id: string) => {
  await apiFetch<ApiResponse<void>>(`/api/v1/users/${id}`, {
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
  return await apiFetch<ApiResponse<ContactMessage>>("/api/v1/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchAdminMessages = async (
  params: Record<string, string | number> = {}
): Promise<{
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
  const data = await apiFetch<ApiResponse<ContactMessage[]>>(
    `/api/v1/messages?${query.toString()}`
  );
  return {
    messages: data.data.data,
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 10,
    countsByStatus: data.countsByStatus || { unread: 0, read: 0, archived: 0 },
  };
};

export const markMessageAsRead = async (id: string) => {
  return await apiFetch<ApiResponse<void>>(`/api/v1/messages/${id}/read`, {
    method: "PATCH",
  });
};

export const archiveMessage = async (id: string) => {
  return await apiFetch<ApiResponse<void>>(`/api/v1/messages/${id}/archive`, {
    method: "PATCH",
  });
};

export const deleteMessage = async (id: string) => {
  await apiFetch<ApiResponse<void>>(`/api/v1/messages/${id}`, {
    method: "DELETE",
  });
};

export const getUnreadMessagesCount = async (): Promise<number> => {
  const data = await apiFetch<{
    data: { data?: { count: number }; count?: number };
  }>("/api/v1/messages/unread-count");
  // Handle inconsistent nesting from backend: data.data.count or data.data.data.count
  const count = data.data?.data?.count ?? data.data?.count;
  return typeof count === "number" ? count : 0;
};
