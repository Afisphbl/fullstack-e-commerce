import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories, Product, Category } from "@/lib/api";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductsGrid } from "@/components/shop/ProductsGrid";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";

const ShopPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceCap, setPriceCap] = useState(10000);
  const [maxPrice, setMaxPrice] = useState(10000);
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
        const backendParams: Record<string, string | number | undefined> = {
          page: currentPage,
          limit: pageSize,
          search: search || undefined,
        };

        if (selectedCategory !== "all")
          backendParams.category = selectedCategory;
        if (selectedBrand !== "all") backendParams.brand = selectedBrand;

        // Price filtering - only apply if user has narrowed the range
        if (maxPrice < 10000) {
          backendParams["finalPrice[lte]"] = maxPrice;
        }

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

        // Filter out zero-stock products for non-admin users
        const filteredProducts = productsRes.products.filter(
          (product) => product.stock > 0 || isAdminRole(user?.role)
        );

        setProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        setCategories(categoriesRes);

        // Update price cap based on first fetch if needed
        if (productsRes.total > 0 && priceCap === 2500) {
          const max =
            Math.ceil(
              Math.max(...productsRes.products.map((p) => p.price)) / 50,
            ) * 50;
          if (max > priceCap) setPriceCap(max);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [
    currentPage,
    pageSize,
    selectedCategory,
    selectedBrand,
    maxPrice,
    inStockOnly,
    sortBy,
    search,
    priceCap,
    user?.role,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, selectedCategory, selectedBrand, maxPrice, inStockOnly, search]);

  const brands = [...new Set(products.map((product) => product.brand))].sort(
    (a, b) => a.localeCompare(b),
  );

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSearchParams(value === "all" ? {} : { category: value });
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

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ShopHeader search={search} onSearchChange={setSearch} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ShopFilters
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          maxPrice={maxPrice}
          priceCap={priceCap}
          inStockOnly={inStockOnly}
          discountOnly={discountOnly}
          newOnly={newOnly}
          onCategoryChange={handleCategoryChange}
          onBrandChange={setSelectedBrand}
          onMaxPriceChange={setMaxPrice}
          onInStockChange={setInStockOnly}
          onDiscountChange={setDiscountOnly}
          onNewChange={setNewOnly}
          onClearFilters={clearFilters}
        />

        <section>
          <ShopToolbar
            totalProducts={totalProducts}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />

          <ProductsGrid
            products={products}
            isLoading={isLoading}
            totalProducts={totalProducts}
          />

          {totalProducts > pageSize && (
            <ShopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopPage;
