import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductBySlug, fetchProducts, Product, fetchReviewsByProduct } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import {
  ProductImageGallery,
  ProductInfo,
  ProductActions,
  ProductSpecifications,
  ReviewsList,
  ReviewForm,
  RelatedProducts,
  ProductDetailSkeleton,
} from "@/components/product-detail";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
  };
}

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewLimit = 10;

  const loadProductData = useCallback(async () => {
    if (!slug) return;
    
    setIsLoading(true);
    try {
      const p = await fetchProductBySlug(slug);
      if (p) {
        setProduct(p);

        // Fetch reviews and related products in parallel
        const [reviewsRes, allProductsRes] = await Promise.all([
          fetchReviewsByProduct(p.id, reviewPage, reviewLimit),
          fetchProducts(),
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
            const sharedTags =
              item.tags?.filter((tag) => p.tags?.includes(tag)).length || 0;
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
  }, [slug, reviewPage, reviewLimit]);

  useEffect(() => {
    if (slug) {
      loadProductData();
    }
  }, [slug, loadProductData]);

  const existingReview = reviews.find((r) => r.user?._id === user?._id);

  const handleReviewSubmitted = async () => {
    if (!product) return;
    const reviewsRes = await fetchReviewsByProduct(
      product.id,
      reviewPage,
      reviewLimit,
    );
    setReviews(reviewsRes.reviews);
    setTotalReviews(reviewsRes.total);
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <ProductImageGallery images={product.images} productName={product.name} />

        <div>
          <ProductInfo product={product} />
          <ProductActions product={product} />
          <ProductSpecifications product={product} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <ReviewsList
            reviews={reviews}
            totalReviews={totalReviews}
            currentPage={reviewPage}
            reviewLimit={reviewLimit}
            onPageChange={setReviewPage}
          />
        </div>

        <div className="space-y-6">
          <ReviewForm
            productId={product.id}
            existingReview={existingReview}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      </div>

      <RelatedProducts products={related} />
    </div>
  );
};

export default ProductDetailPage;
