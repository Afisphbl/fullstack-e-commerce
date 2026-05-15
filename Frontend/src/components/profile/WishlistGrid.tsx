import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";

export const WishlistGrid = () => {
  const { t } = useTranslation("profile");
  const { favorites, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoadingSpinner size="lg" label={t("loadingWishlist")} />
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
        {t("wishlist")} ({favorites.length})
      </h2>
      {favorites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          {t("emptyWishlist")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};
