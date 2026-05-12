export interface Address {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
}

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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo: string;
  status?: string;
  addresses?: Address[];
}

export interface AdminUserEvent {
  id: string;
  type: string;
  title: string;
  time: string;
}

export interface ApiResponse<T> {
  status: string;
  data: {
    data: T;
  };
  total?: number;
  page?: number;
  limit?: number;
  countsByStatus?: { unread: number; read: number; archived: number };
  meta?: {
    recentEvents: AdminUserEvent[];
  };
}

export type ProductStatus = "active" | "inactive" | "out_of_stock" | "archived";

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  image: string;
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
  category: Category | string | null;
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
  status?: ProductStatus;
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

export interface AuthResponse {
  status: string;
  token?: string;
  data: {
    user: User;
  };
}

export interface ProfileResponse {
  status: string;
  data: {
    user: User;
  };
}

export interface UploadResponse {
  status: string;
  url: string;
}

export interface WishlistProductAnalytics {
  productId: string;
  productImage: string;
  productName: string;
  productPrice: number;
  wishlistCount: number;
}

export interface WishlistAnalytics {
  topWishlistedProducts: WishlistProductAnalytics[];
  stats: {
    totalWishlistItems: number;
    avgWishlistSize: number;
  };
}

export interface AdminDashboardData {
  orderStats: Record<string, unknown>;
  productStats: Record<string, unknown>;
  wishlistAnalytics: WishlistAnalytics;
  topProducts: Product[];
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: Order[];
  revenue: number;
}
