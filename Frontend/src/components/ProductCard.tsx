import { Link } from "react-router-dom";
import { Heart, ShoppingCart, GitCompare } from "lucide-react";
import { Product } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatCurrency } from "@/lib/formatters";
import { useLocationCheck } from "@/hooks/useLocationCheck";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { isDeliveryAvailable, isLoading: isLocChecking } = useLocationCheck();

  // Hide zero-stock products from non-admin users
  if (product.stock === 0 && !isAdminRole(user?.role)) {
    return null;
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const stockTone =
    product.stock > 10
      ? "text-success"
      : product.stock > 0
        ? "text-warning"
        : "text-destructive";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/90 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated animate-fade-in">
      <div className="relative overflow-hidden aspect-[4/3]">
        <Link to={`/product/${product.slug}`}>
          <OptimizedImage
            src={product.image}
            alt={product.name}
            widths={[240, 360, 480, 640]}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            optimizeWidth={480}
            optimizeHeight={360}
            crop="fill"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground text-xs">
              NEW
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs">
              -{discount}%
            </Badge>
          )}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => toggleFavorite(product)}
            aria-label={
              isFavorite(product.id)
                ? "Remove from favorites"
                : "Add to favorites"
            }
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${isFavorite(product.id) ? "bg-destructive/90 text-destructive-foreground" : "bg-card/70 text-muted-foreground hover:text-destructive"}`}
          >
            <Heart
              className="h-4 w-4"
              fill={isFavorite(product.id) ? "currentColor" : "none"}
            />
          </button>
          <button
            type="button"
            onClick={() =>
              isInCompare(product.id)
                ? removeFromCompare(product.id)
                : addToCompare(product)
            }
            aria-label={
              isInCompare(product.id) ? "Remove from compare" : "Add to compare"
            }
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${isInCompare(product.id) ? "bg-primary/90 text-primary-foreground" : "bg-card/70 text-muted-foreground hover:text-primary"}`}
          >
            <GitCompare className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <span className={`text-[11px] font-medium ${stockTone}`}>
            {product.stock > 0 ? "In Stock" : "Out"}
          </span>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {!isAdminRole(user?.role) && (
            <Button
              size="sm"
              onClick={() => addToCart(product)}
              disabled={isLocChecking || !isDeliveryAvailable}
              className={`h-8 px-3 text-xs ${isLocChecking || !isDeliveryAvailable ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              title={
                isLocChecking
                  ? "Checking availability..."
                  : !isDeliveryAvailable
                    ? "Delivery is not available in your region"
                    : ""
              }
            >
              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
              {isLocChecking
                ? "Checking..."
                : !isDeliveryAvailable
                  ? "Not available"
                  : "Add"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
