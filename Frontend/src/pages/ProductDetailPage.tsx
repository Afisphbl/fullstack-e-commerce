import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductBySlug, fetchProducts, Product, fetchReviewsByProduct, createReview, updateReview } from "@/lib/api";

import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { useAuth } from "@/contexts/AuthContext";
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
  Star as StarIcon,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/StarRating";
import { toast } from "sonner";

const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="h-4 w-24 bg-muted rounded mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-md" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-md" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const reviewLimit = 10;

  useEffect(() => {
    if (slug) {
      const loadProductData = async () => {
        setIsLoading(true);
        try {
          const p = await fetchProductBySlug(slug);
          if (p) {
            setProduct(p);
            setSelectedImage(0);
            setQuantity(1);
            
            // Fetch reviews and related products in parallel
            const [reviewsRes, allProductsRes] = await Promise.all([
              fetchReviewsByProduct(p.id, reviewPage, reviewLimit),
              fetchProducts()
            ]);
            
            setReviews(reviewsRes.reviews);
            setTotalReviews(reviewsRes.total);
            
            const allProducts = allProductsRes.products;
            
            const scored = allProducts
              .filter((x) => x.id !== p.id)
              .map((item) => {
                let score = 0;
                if (item.category === p.category) score += 3;
                if (item.brand === p.brand) score += 2;
                const sharedTags = item.tags?.filter((tag) =>
                  p.tags?.includes(tag),
                ).length || 0;
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
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadProductData();
    }
  }, [slug, reviewPage]);

  const existingReview = reviews.find(r => r.user?._id === user?._id);

  useEffect(() => {
    if (existingReview) {
      setNewRating(existingReview.rating);
      setNewComment(existingReview.review);
    }
  }, [existingReview]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      if (existingReview) {
        await updateReview(product.id, existingReview._id, {
          rating: newRating,
          review: newComment,
        });
        toast.success("Review updated successfully!");
      } else {
        await createReview(product.id, {
          rating: newRating,
          review: newComment,
        });
        toast.success("Review submitted successfully!");
      }
      
      // Refresh reviews
      const reviewsRes = await fetchReviewsByProduct(product.id, reviewPage, reviewLimit);
      setReviews(reviewsRes.reviews);
      setTotalReviews(reviewsRes.total);
    } catch (error: any) {
      toast.error(error.message || "Failed to save review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };




  if (isLoading) return <ProductDetailSkeleton />;

  if (!product)
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Product not found.
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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.ratingsAverage) ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground ml-1">
                {product.ratingsAverage}
              </span>
            </div>
            <span className="text-sm text-muted-foreground border-l border-border pl-4">
              {product.ratingsQuantity} Reviews
            </span>
            <span className="text-sm text-muted-foreground border-l border-border pl-4">
              {product.sold} Sold
            </span>
          </div>

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
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-xl font-display font-semibold text-foreground mb-6">
              Specifications
            </h3>
            <div className="space-y-6">
              {product.specification ? (
                // Grouped Specifications from Backend
                product.specification.details.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-3">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">
                      {group.group}
                    </h4>
                    <div className="space-y-2">
                      {group.specs.map((spec, specIdx) => (
                        <div
                          key={specIdx}
                          className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0"
                        >
                          <span className="text-muted-foreground">{spec.name}</span>
                          <span className="font-medium text-foreground">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Fallback to flat specs (attributes)
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Customer Reviews ({totalReviews})
            </h2>
            
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    {/* ... review display ... */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{review.user?.name || 'Anonymous'}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {review.review}
                    </p>
                  </div>
                ))}

                {/* Review Pagination */}
                {totalReviews > reviewLimit && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage === 1}
                      onClick={() => setReviewPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground px-4">
                      Page {reviewPage} of {Math.ceil(totalReviews / reviewLimit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage === Math.ceil(totalReviews / reviewLimit)}
                      onClick={() => setReviewPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
            <h3 className="text-xl font-display font-bold text-foreground mb-6">
              {existingReview ? "Update Your Review" : "Write a Review"}
            </h3>
            
            {!isAuthenticated ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-muted-foreground">Please log in to share your experience with this product.</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            ) : user?.role !== 'user' ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Only customers can leave reviews.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Your Rating</label>
                  <StarRating 
                    defaultRating={newRating} 
                    onSetRating={setNewRating}
                    size={28}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="review" className="text-sm font-medium text-muted-foreground">
                    Your Review <span className="text-xs text-muted-foreground">(min. 10 chars)</span>
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    minLength={10}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmittingReview || newComment.trim().length < 10}
                >
                  {isSubmittingReview ? "Saving..." : (existingReview ? "Update Review" : "Submit Review")}
                </Button>
              </form>
            )}
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
