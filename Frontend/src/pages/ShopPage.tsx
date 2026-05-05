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
import { Search, SlidersHorizontal } from "lucide-react";

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceCap, setPriceCap] = useState(2500);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category") || "all";
    setSelectedCategory(categoryFromQuery);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const dataMax =
      Math.ceil(Math.max(...products.map((p) => p.price)) / 50) * 50;
    setPriceCap(dataMax);
    setMaxPrice(dataMax);
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    sortBy,
    selectedCategory,
    selectedBrand,
    maxPrice,
    inStockOnly,
    discountOnly,
    newOnly,
  ]);

  const brands = [...new Set(products.map((product) => product.brand))].sort(
    (a, b) => a.localeCompare(b),
  );

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

  const filtered = products
    .filter(
      (p) => selectedCategory === "all" || p.category === selectedCategory,
    )
    .filter((p) => selectedBrand === "all" || p.brand === selectedBrand)
    .filter((p) => p.price <= maxPrice)
    .filter((p) => !inStockOnly || p.stock > 0)
    .filter((p) => !discountOnly || !!p.originalPrice)
    .filter((p) => !newOnly || p.isNew)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "newest") return Number(b.isNew) - Number(a.isNew);
      return b.featured ? 1 : -1;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));

  const pageWindow = [] as number[];
  for (
    let page = Math.max(1, safeCurrentPage - 1);
    page <= Math.min(totalPages, safeCurrentPage + 1);
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
              {filtered.length} products found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by</span>
              <Select value={sortBy} onValueChange={setSortBy}>
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
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg">
                No products found matching your criteria.
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(safeCurrentPage - 1);
                    }}
                    className={
                      safeCurrentPage === 1
                        ? "pointer-events-none opacity-40"
                        : ""
                    }
                  />
                </PaginationItem>

                {safeCurrentPage > 2 && (
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
                    {safeCurrentPage > 3 && (
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
                      isActive={page === safeCurrentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {safeCurrentPage < totalPages - 1 && (
                  <>
                    {safeCurrentPage < totalPages - 2 && (
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
                      goToPage(safeCurrentPage + 1);
                    }}
                    className={
                      safeCurrentPage === totalPages
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
