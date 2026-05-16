import { useState, useDeferredValue, useEffect } from "react";
import { fetchProducts, Product, fetchCategories } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ProductPageHeader,
  ProductSearchBar,
  ProductTable,
  ProductFormDialog,
  StockFilterTabs,
  StockTab,
  useProductMutations,
} from "@/components/admin/products";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { useTranslation } from "react-i18next";

const AdminProductsPage = () => {
  const { t } = useTranslation("admin");
  usePageTitle(`${t("products")} - Admin`);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockTab | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [
      "adminProducts",
      selectedCategory,
      selectedBrand,
      stockFilter,
      deferredSearch,
      sortBy,
      currentPage,
    ],
    queryFn: () => {
      const backendParams: Record<string, string | number | boolean> = {
        page: currentPage,
        limit: pageSize,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedBrand !== "all" && { brand: selectedBrand }),
        ...(deferredSearch && { search: deferredSearch }),
      };

      if (stockFilter === "in_stock") {
        backendParams["stock[gt]"] = 0;
      } else if (stockFilter === "out_of_stock") {
        backendParams["stock"] = 0;
      } else if (stockFilter === "low_stock") {
        backendParams["stock[gt]"] = 0;
        backendParams["stock[lte]"] = 10;
      }

      if (sortBy === "name-asc") backendParams.sort = "name";
      else if (sortBy === "name-desc") backendParams.sort = "-name";
      else if (sortBy === "price-low") backendParams.sort = "price";
      else if (sortBy === "price-high") backendParams.sort = "-price";
      else if (sortBy === "newest") backendParams.sort = "-createdAt";

      return fetchProducts(backendParams);
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Extract unique brands from products - Note: this will only show brands from current page
  // In a real app, you might want a separate brands endpoint
  const brands = Array.from(
    new Set(productsData?.products?.map((p) => p.brand).filter(Boolean) || [])
  ).sort();

  const { deleteMutation } = useProductMutations(editingProduct, () => {
    setDialogOpen(false);
    setEditingProduct(null);
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, stockFilter, deferredSearch]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteMutation.mutate(productId);
  };

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const totalPages = Math.max(
    1,
    Math.ceil((productsData?.total || 0) / pageSize)
  );

  return (
    <div className="space-y-6">
      <ProductPageHeader
        totalProducts={productsData?.total || 0}
        onAddProduct={handleAddProduct}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        onCategoryChange={setSelectedCategory}
        onBrandChange={setSelectedBrand}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <ProductSearchBar value={search} onChange={setSearch} />

      <StockFilterTabs activeTab={stockFilter} onTabChange={setStockFilter} />

      <ProductTable
        products={productsData?.products || []}
        isLoading={productsLoading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <ShopPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingProduct={editingProduct}
        categories={categories}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default AdminProductsPage;
