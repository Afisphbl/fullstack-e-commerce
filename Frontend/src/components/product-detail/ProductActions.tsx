import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShoppingCart,
  GitCompare,
  Minus,
  Plus,
} from "lucide-react";
import { Product } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";

interface ProductActionsProps {
  product: Product;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-border rounded-md">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-4 font-medium text-foreground">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Button
          onClick={() => addToCart(product, quantity)}
          size="lg"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
        >
          <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => toggleFavorite(product)}
          className={
            isFavorite(product.id)
              ? "border-destructive text-destructive"
              : ""
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
