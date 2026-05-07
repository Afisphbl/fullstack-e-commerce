import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories, Product, Category } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/90 p-3 space-y-4">
    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    </div>
  </div>
);

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceCap, setPriceCap] = useState(2500);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category") || "all";
    setSelectedCategory(categoryFromQuery);
    
    const sortFromQuery = searchParams.get("sort") || "featured";
    setSortBy(sortFromQuery);
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const backendParams: Record<string, any> = {
          page: currentPage,
          limit: pageSize,
          search: search || undefined,
        };

        if (selectedCategory !== "all") backendParams.category = selectedCategory;
        if (selectedBrand !== "all") backendParams.brand = selectedBrand;
        
        // Price filtering
        backendParams["price[lte]"] = maxPrice;
        
        if (inStockOnly) backendParams["stock[gt]"] = 0;
        
        // Sorting
        if (sortBy === "newest") backendParams.sort = "-createdAt";
        else if (sortBy === "price-low") backendParams.sort = "price";
        else if (sortBy === "price-high") backendParams.sort = "-price";
        else if (sortBy === "rating") backendParams.sort = "-ratingsAverage";
        else backendParams.sort = "-ratingsAverage"; // featured

        const [productsRes, categoriesRes] = await Promise.all([
          fetchProducts(backendParams),
          fetchCategories(),
        ]);
        
        setProducts(productsRes.products);
        setTotalProducts(productsRes.total);
        setCategories(categoriesRes);
        
        // Update price cap based on first fetch if needed
        if (productsRes.total > 0 && priceCap === 2500) {
          const max = Math.ceil(Math.max(...productsRes.products.map(p => p.price)) / 50) * 50;
          if (max > priceCap) setPriceCap(max);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentPage, pageSize, selectedCategory, selectedBrand, maxPrice, inStockOnly, sortBy, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    sortBy,
    selectedCategory,
    selectedBrand,
    maxPrice,
    inStockOnly,
    search,
  ]);

  const brands = [...new Set(products.map((product) => product.brand))].sort(
    (a, b) => a.localeCompare(b),
  );

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSearchParams({});
    setSortBy("featured");
    setMaxPrice(priceCap);
    setInStockOnly(false);
    setDiscountOnly(false);
    setNewOnly(false);
  };

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const currentProducts = products;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageWindow = [] as number[];
  for (
    let page = Math.max(1, currentPage - 1);
    page <= Math.min(totalPages, currentPage + 1);
    page += 1
  ) {
    pageWindow.push(page);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        Shop Electronics
      </h1>

      <div className="mb-8">
        <div className="relative max-w-3xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, brands, or specs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 bg-card pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/70 p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h2>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Reset
            </Button>
          </div>

          <div className="mb-5 space-y-2 border-b border-border/70 pb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </h3>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setSearchParams(value === "all" ? {} : { category: value });
              }}
            >
              <SelectTrigger className="w-full bg-background/70">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-5 space-y-2 border-b border-border/70 pb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Brand
            </h3>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full bg-background/70">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-5 border-b border-border/70 pb-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price Range
              </h3>
              <span className="text-xs font-medium text-foreground">
                Up to ${maxPrice.toFixed(0)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={priceCap}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Maximum price"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={inStockOnly ? "default" : "outline"}
                onClick={() => setInStockOnly((v) => !v)}
                className="rounded-full"
              >
                In Stock
              </Button>
              <Button
                size="sm"
                variant={discountOnly ? "default" : "outline"}
                onClick={() => setDiscountOnly((v) => !v)}
                className="rounded-full"
              >
                On Sale
              </Button>
              <Button
                size="sm"
                variant={newOnly ? "default" : "outline"}
                onClick={() => setNewOnly((v) => !v)}
                className="rounded-full"
              >
                New Arrivals
              </Button>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {totalProducts} products found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-9 w-44 bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : null}
          </div>

          {!isLoading && totalProducts === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg">
                No products found matching your criteria.
              </p>
            </div>
          )}

          {totalProducts > pageSize && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) goToPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-40"
                        : ""
                    }
                  />
                </PaginationItem>

                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}

                {pageWindow.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}

                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages

                        ? "pointer-events-none opacity-40"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopPage;
