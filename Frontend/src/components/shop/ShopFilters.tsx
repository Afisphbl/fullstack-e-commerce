import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Category } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

interface ShopFiltersProps {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  maxPrice: number;
  priceCap: number;
  inStockOnly: boolean;
  discountOnly: boolean;
  newOnly: boolean;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
  onInStockChange: (value: boolean) => void;
  onDiscountChange: (value: boolean) => void;
  onNewChange: (value: boolean) => void;
  onClearFilters: () => void;
}

export const ShopFilters = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  maxPrice,
  priceCap,
  inStockOnly,
  discountOnly,
  newOnly,
  onCategoryChange,
  onBrandChange,
  onMaxPriceChange,
  onInStockChange,
  onDiscountChange,
  onNewChange,
  onClearFilters,
}: ShopFiltersProps) => {
  const { t } = useTranslation();
  
  return (
    <aside className="h-fit rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/70 p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4" /> {t('shop.filters')}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          {t('shop.reset')}
        </Button>
      </div>

      {/* <div className="mb-5 space-y-2 border-b border-border/70 pb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Category
        </h3>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full bg-background/70">
            <SelectValue placeholder="Choose category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories
              .filter((cat) => cat.id)
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div> */}

      <div className="mb-5 space-y-2 border-b border-border/70 pb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('shop.brand')}
        </h3>
        <Select value={selectedBrand} onValueChange={onBrandChange}>
          <SelectTrigger className="w-full bg-background/70">
            <SelectValue placeholder={t('shop.selectBrand')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('shop.allBrands')}</SelectItem>
            {brands
              .filter((brand) => brand)
              .map((brand) => (
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
            {t('shop.priceRange')}
          </h3>
          <span className="text-xs font-medium text-foreground">
            {t('shop.upTo')} ${maxPrice.toFixed(0)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={priceCap}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          aria-label="Maximum price"
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('shop.quickFilters')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={inStockOnly ? "default" : "outline"}
            onClick={() => onInStockChange(!inStockOnly)}
            className="rounded-full"
          >
            {t('shop.inStock')}
          </Button>
          <Button
            size="sm"
            variant={discountOnly ? "default" : "outline"}
            onClick={() => onDiscountChange(!discountOnly)}
            className="rounded-full"
          >
            {t('shop.onSale')}
          </Button>
          <Button
            size="sm"
            variant={newOnly ? "default" : "outline"}
            onClick={() => onNewChange(!newOnly)}
            className="rounded-full"
          >
            {t('shop.newArrivals')}
          </Button>
        </div>
      </div>
    </aside>
  );
};
