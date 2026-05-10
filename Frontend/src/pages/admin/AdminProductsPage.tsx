import { useState } from "react";
import { fetchProducts, Product, fetchCategories } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ProductPageHeader,
  ProductSearchBar,
  ProductTable,
  ProductFormDialog,
  useProductFilters,
  useProductMutations,
} from "@/components/admin/products";
import { usePageTitle } from "@/hooks/usePageTitle";

const AdminProductsPage = () => {
  usePageTitle("Admin - Products");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts", selectedCategory, selectedBrand],
    queryFn: () => fetchProducts({ 
      limit: 100,
      ...(selectedCategory !== "all" && { category: selectedCategory }),
      ...(selectedBrand !== "all" && { brand: selectedBrand }),
    }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Extract unique brands from products
  const brands = Array.from(
    new Set(productsData?.products?.map((p) => p.brand).filter(Boolean) || [])
  ).sort();

  const { search, setSearch, filteredProducts } = useProductFilters(
    productsData?.products
  );

  const { deleteMutation } = useProductMutations(editingProduct, () => {
    setDialogOpen(false);
    setEditingProduct(null);
  });

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
      />

      <ProductSearchBar value={search} onChange={setSearch} />

      <ProductTable
        products={filteredProducts}
        isLoading={productsLoading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

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
