import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Truck, Shield, Zap } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  fetchFeaturedProducts,
  fetchCategories,
  fetchProducts,
  Product,
  Category,
} from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { useFeatures } from "@/hooks/useFeatures";
import { usePageContent } from "@/hooks/usePageContent";
import { HeroSkeleton } from "@/components/shared/HeroSkeleton";
import { FeaturesSkeleton } from "@/components/shared/FeaturesSkeleton";

const Index = () => {
  usePageTitle("Home");
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch CMS content
  const { data: heroSlides, isLoading: loadingHero, error: heroError } = useHeroSlides();
  const { data: features, isLoading: loadingFeatures, error: featuresError } = useFeatures();
  const { data: pageContent, isLoading: loadingContent } = usePageContent("home");

  // Fallback hero slides if API fails
  const defaultHeroSlides = [
    {
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
      title: "Powerful Laptops",
      subtitle: "Built for creators and pros",
    },
    {
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200",
      title: "Smart Flagship Phones",
      subtitle: "Performance meets elegance",
    },
    {
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200",
      title: "Ultra-Clear Displays",
      subtitle: "Visuals that redefine detail",
    },
  ];

  // Fallback features if API fails
  const defaultFeatures = [
    { icon: "Truck", title: "Free Shipping", description: "On orders over $100" },
    { icon: "Shield", title: "2 Year Warranty", description: "Extended protection" },
    { icon: "Zap", title: "Fast Support", description: "24/7 expert help" },
  ];

  // Use CMS data or fallback
  const displayHeroSlides = heroSlides && heroSlides.length > 0 ? heroSlides : defaultHeroSlides;
  const displayFeatures = features && features.length > 0 ? features : defaultFeatures;

  useEffect(() => {
    setLoadingFeatured(true);
    fetchFeaturedProducts().then((products) => {
      // Filter out zero-stock products for non-admin users
      const filtered = products.filter(
        (product) => product.stock > 0 || isAdminRole(user?.role)
      );
      setFeatured(filtered);
      setLoadingFeatured(false);
    }).catch(() => setLoadingFeatured(false));

    setLoadingNewArrivals(true);
    fetchProducts({ sort: "-createdAt", limit: 50 }).then((res) => {
      // Filter out zero-stock products for non-admin users
      const filtered = res.products.filter(
        (product) => (product.isNew && product.stock > 0) || (product.isNew && isAdminRole(user?.role))
      );
      setNewArrivals(filtered);
      setLoadingNewArrivals(false);
    }).catch(() => setLoadingNewArrivals(false));

    setLoadingCategories(true);
    fetchCategories().then((cats) => {
      setCategories(cats);
      setLoadingCategories(false);
    }).catch(() => setLoadingCategories(false));
  }, [user?.role]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % displayHeroSlides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [displayHeroSlides.length]);

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Zap;
  };

  // Get CTA content from page content
  const ctaSection = pageContent?.sections?.find((s) => s.key === "cta");
  const ctaTitle = ctaSection?.title || "Ready to Upgrade?";
  const ctaDescription = ctaSection?.description || "Join thousands of tech enthusiasts who trust VoltEdge for the latest in consumer electronics.";
  const ctaButtonText = ctaSection?.buttonText || "Explore Collection";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {loadingHero ? (
        <HeroSkeleton />
      ) : (
      <section className="bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float [animation-delay:3s]" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="max-w-2xl animate-slide-up">
              <p className="text-accent font-display text-sm tracking-widest mb-4">
                NEXT-GEN ELECTRONICS
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
                Experience The <span className="text-gradient">Future</span> Of
                Technology
              </h1>
              <p className="text-lg text-primary-foreground/70 mb-8 font-body">
                Discover cutting-edge electronics with unmatched performance.
                From AI-powered laptops to quantum displays — we bring
                tomorrow's tech today.
              </p>
              <div className="flex gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon font-display text-sm"
                >
                  <Link to="/shop">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border bg-background/90 text-foreground hover:bg-background font-display text-sm"
                >
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 p-2 shadow-2xl">
              <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
                {displayHeroSlides.map((slide, idx) => (
                  <img
                    key={idx}
                    src={'image' in slide ? slide.image : slide.image}
                    alt={'title' in slide ? slide.title : 'Hero slide'}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === slideIndex ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-accent">
                    Featured
                  </p>
                  <h3 className="text-xl font-display font-bold text-white">
                    {'title' in displayHeroSlides[slideIndex] ? displayHeroSlides[slideIndex].title : ''}
                  </h3>
                  <p className="text-sm text-white/80">
                    {'subtitle' in displayHeroSlides[slideIndex] ? displayHeroSlides[slideIndex].subtitle : ''}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-1.5">
                {displayHeroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
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
      )}

      {/* Features */}
      {loadingFeatures ? (
        <FeaturesSkeleton />
      ) : (
      <section className="py-12 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayFeatures.map((feature) => {
              const Icon = getIconComponent('icon' in feature ? feature.icon : 'Zap');
              return (
                <div key={'_id' in feature ? feature._id : feature.title} className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Categories */}
      <section className="py-16 bg-background">
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
            {loadingCategories ? (
              // Skeleton loaders for categories
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
            ) : (
              categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="group relative rounded-lg overflow-hidden aspect-square"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Featured Products
            </h2>
            <Link
              to="/shop"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingFeatured ? (
              // Skeleton loaders for products
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted rounded w-20" />
                      <div className="h-8 bg-muted rounded w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              New Arrivals
            </h2>
            <Link
              to="/shop"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingNewArrivals ? (
              // Skeleton loaders for products
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted rounded w-20" />
                      <div className="h-8 bg-muted rounded w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-display font-bold mb-4">
            {ctaTitle}
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            {ctaDescription}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon font-display text-sm"
          >
            <Link to={ctaSection?.buttonLink || "/shop"}>
              {ctaButtonText} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
