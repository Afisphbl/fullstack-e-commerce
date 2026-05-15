import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck, ChevronRight } from "lucide-react";
import { fetchFeaturedProducts, fetchProducts, Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { isAdminRole } from "@/lib/roles";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { buildSrcSet, optimizeImageUrl, preloadImage } from "@/lib/images";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/shared/SEOHead";

const Index = () => {
  const { t } = useTranslation(["common", "home"]);
  const { settings } = useSiteSettings();
  const heroSlides = settings.heroSlides?.length > 0 ? settings.heroSlides : [];
  const { user } = useAuth();
  usePageTitle(t("home:sections.featuredProducts"));
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const activeHeroSlide = heroSlides[slideIndex];
  const heroSizes = "(min-width: 1024px) 50vw, 100vw";
  const heroSrcSet = activeHeroSlide?.image
    ? buildSrcSet(activeHeroSlide.image, [640, 960, 1280, 1600], {
        height: 880,
        crop: "fill",
      })
    : undefined;

  // Get localized hero content
  const localizedHeroEyebrow = useLocalizedField(settings.heroEyebrow);
  const localizedHeroTitle = useLocalizedField(settings.heroTitle);
  const localizedHeroHighlight = useLocalizedField(settings.heroHighlight);
  const localizedHeroSubtitle = useLocalizedField(settings.heroSubtitle);
  const localizedHeroCtaText = useLocalizedField(settings.heroCtaText);
  const localizedSlideTitle = useLocalizedField(heroSlides[slideIndex]?.title);
  const localizedSlideSubtitle = useLocalizedField(
    heroSlides[slideIndex]?.subtitle
  );

  useEffect(() => {
    setLoadingFeatured(true);
    fetchFeaturedProducts()
      .then((products) => {
        // Filter out zero-stock products for non-admin users
        const filtered = products.filter(
          (product) => product.stock > 0 || isAdminRole(user?.role)
        );
        setFeatured(filtered);
        setLoadingFeatured(false);
      })
      .catch(() => setLoadingFeatured(false));

    setLoadingNewArrivals(true);
    fetchProducts({ sort: "-createdAt", limit: 50 })
      .then((res) => {
        // Filter out zero-stock products for non-admin users
        const filtered = res.products.filter(
          (product) =>
            (product.isNew && product.stock > 0) ||
            (product.isNew && isAdminRole(user?.role))
        );
        setNewArrivals(filtered);
        setLoadingNewArrivals(false);
      })
      .catch(() => setLoadingNewArrivals(false));

    // setLoadingCategories(true);
    // fetchCategories()
    //   .then((cats) => {
    //     setCategories(cats);
    //     setLoadingCategories(false);
    //   })
    //   .catch(() => setLoadingCategories(false));
  }, [user?.role]);

  useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!activeHeroSlide?.image) return;

    return preloadImage(
      optimizeImageUrl(activeHeroSlide.image, {
        width: 1280,
        height: 880,
        crop: "fill",
      }),
      {
        srcSet: heroSrcSet,
        sizes: heroSizes,
        fetchPriority: "high",
      }
    );
  }, [activeHeroSlide?.image, heroSizes, heroSrcSet]);

  return (
    <>
      <SEOHead
        title={t("home:seo.title")}
        description={t("home:seo.description")}
        keywords={t("home:seo.keywords")}
        type="website"
      />
      <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float [animation-delay:3s]" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="max-w-2xl animate-slide-up">
              <p className="text-accent font-display text-sm tracking-widest mb-4 uppercase">
                {localizedHeroEyebrow}
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight whitespace-pre-wrap">
                {localizedHeroTitle}{" "}
                <span className="text-gradient">{localizedHeroHighlight}</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 mb-8 font-body whitespace-pre-wrap">
                {localizedHeroSubtitle}
              </p>
              <div className="flex gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon font-display text-sm"
                >
                  <Link to={settings.heroCtaLink || "/shop"}>
                    {localizedHeroCtaText || t("common.shopNow")}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border bg-background/90 text-foreground hover:bg-background font-display text-sm"
                >
                  <Link to="/about">{t("common.learnMore")}</Link>
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 p-2 shadow-2xl">
              <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
                {activeHeroSlide && (
                  <OptimizedImage
                    key={activeHeroSlide.image}
                    src={activeHeroSlide.image}
                    alt={localizedSlideTitle}
                    widths={[640, 960, 1280, 1600]}
                    sizes={heroSizes}
                    optimizeWidth={1280}
                    optimizeHeight={880}
                    crop="fill"
                    fetchPriority="high"
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover animate-fade-in"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-accent">
                    {t("common.featured")}
                  </p>
                  <h3 className="text-xl font-display font-bold text-white">
                    {localizedSlideTitle}
                  </h3>
                  <p className="text-sm text-white/80">
                    {localizedSlideSubtitle}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-1.5">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Go to hero slide ${idx + 1}`}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === slideIndex ? "w-6 bg-white" : "w-2 bg-white/45"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border bg-card" aria-label="Store features">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                titleKey: "home:features.freeShipping",
                descKey: "home:features.freeShippingDesc",
              },
              {
                icon: Shield,
                titleKey: "home:features.warranty",
                descKey: "home:features.warrantyDesc",
              },
              {
                icon: Zap,
                titleKey: "home:features.fastSupport",
                descKey: "home:features.fastSupportDesc",
              },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10" aria-hidden="true">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 bg-background" aria-label={t("home:sections.shopByBrand")}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {t("home:sections.shopByBrand")}
            </h2>
            <Link
              to="/shop"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t("home:sections.viewAll")} <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loadingFeatured || loadingNewArrivals
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden aspect-[3/2] bg-muted animate-pulse"
                  />
                ))
              : Array.from(
                  new Set(
                    [...featured, ...newArrivals]
                      .map((p) => p.brand)
                      .filter(Boolean)
                  )
                )
                  .slice(0, 10)
                  .map((brand) => (
                    <Link
                      key={brand}
                      to={`/shop?brand=${brand}`}
                      className="group relative rounded-xl overflow-hidden aspect-[3/2] border border-border bg-card hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors text-center">
                          {brand}
                        </h3>
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </Link>
                  ))}
          </div>
        </div>
      </section>

      {/* Categories - Commented out for electronics-only focus */}
      {/* <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Shop by Category
            </h2>
            <Link
              to="/shop"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loadingCategories
              ? // Skeleton loaders for categories
                Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden aspect-square bg-muted animate-pulse"
                  >
                    <div className="absolute bottom-3 left-3 space-y-2">
                      <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
                      <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                ))
              : categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
                    className="group relative rounded-lg overflow-hidden aspect-square"
                  >
                    <OptimizedImage
                      src={cat.image}
                      alt={cat.name}
                      widths={[240, 360, 480, 640]}
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                      optimizeWidth={480}
                      optimizeHeight={480}
                      crop="fill"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent dark:from-white/80 dark:to-white/15" />
                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-display text-sm font-bold text-white dark:text-black">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-white/80 dark:text-black/80">
                        {cat.count} products
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section className="py-16 bg-card" aria-label={t("home:sections.featuredProducts")}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {t("home:sections.featuredProducts")}
            </h2>
            <Link
              to="/shop"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t("home:sections.viewAll")} <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingFeatured
              ? // Skeleton loaders for products
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-card overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-muted rounded w-16" />
                        <div className="h-3 bg-muted rounded w-12" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="h-5 bg-muted rounded w-20" />
                        <div className="h-8 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
              : featured
                  .slice(0, 4)
                  .map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={idx === 0 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                    />
                  ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-background" aria-label={t("home:sections.newArrivals")}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {t("home:sections.newArrivals")}
            </h2>
            <Link
              to="/shop"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t("home:sections.viewAll")} <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingNewArrivals
              ? // Skeleton loaders for products
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-card overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-muted rounded w-16" />
                        <div className="h-3 bg-muted rounded w-12" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="h-5 bg-muted rounded w-20" />
                        <div className="h-8 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
              : newArrivals
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-display font-bold mb-4">
            {t("home:cta.title")}
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            {t("home:cta.subtitle")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon font-display text-sm"
          >
            <Link to="/shop">
              {t("home:cta.button")} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  </>);
};

export default Index;
