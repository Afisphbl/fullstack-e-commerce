import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductBySlug, fetchProducts, Product } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  GitCompare,
  Minus,
  Plus,
  ChevronLeft,
} from "lucide-react";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug).then((p) => {
        if (p) {
          setProduct(p);
          setSelectedImage(0);
          setQuantity(1);
          fetchProducts().then((all) => {
            const scored = all
              .filter((x) => x.id !== p.id)
              .map((item) => {
                let score = 0;
                if (item.category === p.category) score += 3;
                if (item.brand === p.brand) score += 2;
                const sharedTags = item.tags.filter((tag) =>
                  p.tags.includes(tag),
                ).length;
                score += sharedTags;
                return { item, score };
              })
              .sort(
                (a, b) =>
                  b.score - a.score ||
                  Number(b.item.isNew) - Number(a.item.isNew) ||
                  b.item.price - a.item.price,
              )
              .slice(0, 4)
              .map((entry) => entry.item);
            setRelated(scored);
          });
        }
      });
    }
  }, [slug]);

  if (!product)
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading...
      </div>
    );

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div className="rounded-lg overflow-hidden bg-card border border-border mb-4 aspect-square">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`Select image ${i + 1}`}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-border"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-display font-bold text-foreground">
              ${product.price}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
                <Badge className="bg-destructive text-destructive-foreground">
                  -{discount}%
                </Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-1 mb-2 text-sm">
            <span
              className={`font-medium ${product.stock > 10 ? "text-success" : product.stock > 0 ? "text-warning" : "text-destructive"}`}
            >
              {product.stock > 10
                ? "In Stock"
                : product.stock > 0
                  ? `Only ${product.stock} left`
                  : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-medium text-foreground">
                {quantity}
              </span>
              <button
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

          {/* Specs */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-display font-semibold text-foreground mb-4">
              Specifications
            </h3>
            <div className="space-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between text-sm py-2 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
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
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
