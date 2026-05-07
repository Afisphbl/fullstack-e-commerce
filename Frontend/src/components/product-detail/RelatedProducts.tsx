import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";

interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const { user } = useAuth();
  
  // Filter out zero-stock products for non-admin users
  const visibleProducts = products.filter(
    (product) => product.stock > 0 || isAdminRole(user?.role)
  );

  if (visibleProducts.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Recommended For You
          </p>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Similar Items You May Like
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all products
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
