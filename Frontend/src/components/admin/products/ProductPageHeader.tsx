import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Category } from "@/types/api";

interface ProductPageHeaderProps {
  totalProducts: number;
  onAddProduct: () => void;
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const ProductPageHeader = ({
  totalProducts,
  onAddProduct,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  onCategoryChange,
  onBrandChange,
  sortBy,
  onSortChange,
}: ProductPageHeaderProps) => {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 className="text-2xl font-display font-bold text-foreground">
        {t("totalProducts")}: {totalProducts}
      </h1>

      {/* Filters and Add Button on the right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <Select value={selectedBrand} onValueChange={onBrandChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder={t("allBrands")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allBrands")}</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("newest")}</SelectItem>
            <SelectItem value="price-low">{t("priceLow")}</SelectItem>
            <SelectItem value="price-high">{t("priceHigh")}</SelectItem>
            <SelectItem value="name-asc">{t("nameAsc")}</SelectItem>
            <SelectItem value="name-desc">{t("nameDesc")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={onAddProduct}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> {t("addProduct")}
        </Button>
      </div>
    </div>
  );
};
