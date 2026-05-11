import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { fetchFeaturedProducts, fetchProducts, Product } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";

interface ProductsSectionProps {
  data: {
    title: string;
    filter: "featured" | "new" | string;
    limit?: number;
  };
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ data }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const limit = data.limit || 4;

    if (data.filter === "featured") {
      fetchFeaturedProducts()
        .then((res) => {
          const filtered = res.filter(
            (product) => product.stock > 0 || isAdminRole(user?.role)
          );
          setProducts(filtered.slice(0, limit));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (data.filter === "new") {
      fetchProducts({ sort: "-createdAt", limit: 50 })
        .then((res) => {
          const filtered = res.products.filter(
            (product) =>
              (product.isNew && product.stock > 0) ||
              (product.isNew && isAdminRole(user?.role))
          );
          setProducts(filtered.slice(0, limit));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [data.filter, data.limit, user?.role]);

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {data.title}
          </h2>
          <Link
            to="/shop"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: data.limit || 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-muted rounded w-20" />
                    <div className="h-8 bg-muted rounded w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
