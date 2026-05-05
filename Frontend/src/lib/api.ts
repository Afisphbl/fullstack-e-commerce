import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import blogsData from "@/data/blogs.json";
import ordersData from "@/data/orders.json";
import faqsData from "@/data/faqs.json";
import teamData from "@/data/team.json";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  category: string;
  brand: string;
  image: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  stock: number;
  featured: boolean;
  isNew: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Products
export const fetchProducts = async (): Promise<Product[]> => {
  await delay(100);
  return productsData as Product[];
};

export const fetchProductBySlug = async (
  slug: string,
): Promise<Product | undefined> => {
  await delay(100);
  return (productsData as Product[]).find((p) => p.slug === slug);
};

export const fetchProductById = async (
  id: string,
): Promise<Product | undefined> => {
  await delay(100);
  return (productsData as Product[]).find((p) => p.id === id);
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  await delay(100);
  return (productsData as Product[]).filter((p) => p.featured);
};

export const fetchProductsByCategory = async (
  category: string,
): Promise<Product[]> => {
  await delay(100);
  return (productsData as Product[]).filter((p) => p.category === category);
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  await delay(100);
  return categoriesData as Category[];
};

// Blogs
export const fetchBlogs = async (): Promise<Blog[]> => {
  await delay(100);
  return blogsData as Blog[];
};

export const fetchBlogBySlug = async (
  slug: string,
): Promise<Blog | undefined> => {
  await delay(100);
  return (blogsData as Blog[]).find((b) => b.slug === slug);
};

// Orders
export const fetchOrders = async (): Promise<Order[]> => {
  await delay(100);
  return ordersData as Order[];
};

export const fetchOrderById = async (
  id: string,
): Promise<Order | undefined> => {
  await delay(100);
  return (ordersData as Order[]).find((o) => o.id === id);
};

// FAQ
export const fetchFAQs = async (): Promise<FAQ[]> => {
  await delay(100);
  return faqsData as FAQ[];
};

// Team
export const fetchTeam = async (): Promise<TeamMember[]> => {
  await delay(100);
  return teamData as TeamMember[];
};
