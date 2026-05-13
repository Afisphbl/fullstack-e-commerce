import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, GitCompare, Minus, Plus } from "lucide-react";
import { Product } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";
import { useLocationCheck } from "@/hooks/useLocationCheck";

interface ProductActionsProps {
  product: Product;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { isDeliveryAvailable } = useLocationCheck();

  const handleAddToCart = () => {
    if (product.stock === 0 || quantity > product.stock) return;
    addToCart(product, quantity);
  };

  // Hide cart functionality for admin roles
  if (isAdminRole(user?.role)) {
    return (
      <div className="flex gap-3 mb-8">
        <Button
          variant="outline"
          size="lg"
          onClick={() => toggleFavorite(product)}
          className={
            isFavorite(product.id) ? "border-destructive text-destructive" : ""
          }
        >
          <Heart
            className="h-5 w-5"
            fill={isFavorite(product.id) ? "currentColor" : "none"}
          />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            isInCompare(product.id)
              ? removeFromCompare(product.id)
              : addToCompare(product)
          }
          className={
            isInCompare(product.id) ? "border-primary text-primary" : ""
          }
        >
          <GitCompare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-border rounded-md">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-4 font-medium text-foreground">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock || product.stock === 0}
            aria-label="Increase quantity"
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Button
          onClick={handleAddToCart}
          disabled={
            product.stock === 0 ||
            quantity > product.stock ||
            !isDeliveryAvailable
          }
          size="lg"
          className="flex-1 shadow-neon transition-colors"
          variant={isDeliveryAvailable ? "default" : "secondary"}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {!isDeliveryAvailable
            ? "Delivery not available in your region"
            : product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => toggleFavorite(product)}
          className={
            isFavorite(product.id) ? "border-destructive text-destructive" : ""
          }
        >
          <Heart
            className="h-5 w-5"
            fill={isFavorite(product.id) ? "currentColor" : "none"}
          />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            isInCompare(product.id)
              ? removeFromCompare(product.id)
              : addToCompare(product)
          }
          className={
            isInCompare(product.id) ? "border-primary text-primary" : ""
          }
        >
          <GitCompare className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};
