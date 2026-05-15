import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchProductBySlug,
  fetchProducts,
  Product,
  Category,
  fetchReviewsByProduct,
  Review,
} from "@/lib/api";
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
import { isAdminRole } from "@/lib/roles";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocationCheck } from "@/hooks/useLocationCheck";
import { SEOHead } from "@/components/shared/SEOHead";
import {
  buildProductStructuredData,
  buildBreadcrumbStructuredData,
} from "@/hooks/useSEO";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useTranslation } from "react-i18next";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { t } = useTranslation("product");
  const { isLoading: isLocationLoading } = useLocationCheck();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Localized product name / description for SEO
  const localizedName = useLocalizedField(product?.name);
  const localizedDescription = useLocalizedField(product?.description);

  usePageTitle(localizedName || t("product"));
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewLimit = 10;

  const loadProductDetails = useCallback(async () => {
    if (!slug) {
      setProduct(null);
      setRelated([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const p = await fetchProductBySlug(slug);
      if (!p) {
        setProduct(null);
        setRelated([]);
        return;
      }

      setProduct(p);

      const getCategoryId = (cat: Category | string | null): string => {
        if (!cat) return "";
        if (typeof cat === "string") return cat;
        return cat._id || cat.id;
      };
      const currentCatId = getCategoryId(p.category);

      const allProductsRes = await fetchProducts({ category: currentCatId });
      const allProducts = allProductsRes.products;

      const scored = allProducts
        .filter((x) => x.id !== p.id)
        .map((item) => {
          let score = 0;
          const itemCatId = getCategoryId(item.category);

          if (itemCatId === currentCatId) score += 10;
          if (item.brand === p.brand) score += 5;

          const sharedTags =
            item.tags?.filter((tag) => p.tags?.includes(tag)).length || 0;
          score += sharedTags;

          return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            new Date(b.item.createdAt || 0).getTime() -
              new Date(a.item.createdAt || 0).getTime()
        )
        .slice(0, 4)
        .map((entry) => entry.item);
      setRelated(scored);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const loadReviews = useCallback(async () => {
    if (!slug || !product) {
      setReviews([]);
      setTotalReviews(0);
      return;
    }

    try {
      const reviewsRes = await fetchReviewsByProduct(
        product.id,
        reviewPage,
        reviewLimit
      );
      setReviews(reviewsRes.reviews);
      setTotalReviews(reviewsRes.total);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviews([]);
      setTotalReviews(0);
    }
  }, [slug, product, reviewPage, reviewLimit]);

  useEffect(() => {
    if (slug) {
      loadProductDetails();
    }
  }, [slug, loadProductDetails]);

  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [product, loadReviews]);

  // Build JSON-LD structured data for the product
  const structuredData = useMemo(() => {
    if (!product) return undefined;
    return [
      buildProductStructuredData({
        name: localizedName,
        description: localizedDescription,
        images: product.images,
        price: product.price,
        brand: product.brand,
        ratingsAverage: product.ratingsAverage,
        ratingsCount: product.ratingsQuantity,
        stock: product.stock,
        slug: product.slug,
      }),
      buildBreadcrumbStructuredData([
        { name: "Home", url: window.location.origin },
        { name: "Shop", url: `${window.location.origin}/shop` },
        { name: localizedName, url: window.location.href },
      ]),
    ];
  }, [product, localizedName, localizedDescription]);

  const existingReview = reviews.find((r) => r.user?._id === user?._id);

  const handleReviewSubmitted = async () => {
    await loadReviews();
  };

  if (isLoading || isLocationLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        {t("noProductsFound")}
      </div>
    );
  }

  // Hide zero-stock products from non-admin users
  if (product.stock === 0 && !isAdminRole(user?.role)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        {t("noProductsFound")}
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={localizedName}
        description={localizedDescription}
        image={product.images?.[0]}
        type="product"
        structuredData={structuredData}
      />
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> {t("previous", { ns: "common" })}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

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
    </>
  );
};

export default ProductDetailPage;
