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
    isNew: p.isNew !== undefined ? p.isNew : false, 
  };
};

const mapOrder = (o: any): Order => ({
  id: o._id || o.id,
  userId: typeof o.user === 'object' ? o.user._id : o.user,
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



const mapCategory = (c: any): Category => ({
  ...c,
  id: c.slug || c._id || c.id,
  // Backend category might not have icon/count, providing defaults
  icon: c.icon || "Laptop",
  count: c.count || 0,
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

export const createProduct = async (productData: any) => {
  const data = await apiFetch("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
  return mapProduct(data.data.data);
};

export const updateProduct = async (id: string, productData: any) => {
  const data = await apiFetch(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productData),
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

export const fetchAdminDashboardData = async () => {
  const [orderStats, productStats, productsRes, orders, categories] = await Promise.all([
    fetchOrderStats(),
    fetchProductStats(),
    fetchProducts({ limit: 10, sort: '-sold' }),
    fetchOrders(),
    fetchCategories(),
  ]);

  return {
    orderStats,
    productStats,
    topProducts: productsRes.products,
    totalOrders: orders.length,
    totalProducts: productsRes.total,
    totalCategories: categories.length,
    recentOrders: orders.slice(0, 5),
    revenue: orders.reduce((acc, curr) => acc + curr.total, 0),
  };
};

