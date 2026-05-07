import { Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  totalProducts: number;
}

export const ProductsGrid = ({
  products,
  isLoading,
  totalProducts,
}: ProductsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (totalProducts === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="text-lg">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
