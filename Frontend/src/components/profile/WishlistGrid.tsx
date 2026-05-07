import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";

export const WishlistGrid = () => {
  const { favorites } = useFavorites();

  return (
    <>
      <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
        My Wishlist ({favorites.length})
      </h2>
      {favorites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Your wishlist is empty. Save items to view them here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};
