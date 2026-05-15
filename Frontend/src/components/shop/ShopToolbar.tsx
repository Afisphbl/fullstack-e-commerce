import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface ShopToolbarProps {
  totalProducts: number;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const ShopToolbar = ({
  totalProducts,
  sortBy,
  onSortChange,
}: ShopToolbarProps) => {
  const { t } = useTranslation(["shop"]);

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {totalProducts} {t("shop:productsFound")}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t("shop:sortBy")}
        </span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-44 bg-card">
            <SelectValue placeholder={t("shop:sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">{t("shop:featured")}</SelectItem>
            <SelectItem value="price-low">
              {t("shop:priceLowToHigh")}
            </SelectItem>
            <SelectItem value="price-high">
              {t("shop:priceHighToLow")}
            </SelectItem>
            <SelectItem value="name-asc">{t("shop:nameAZ")}</SelectItem>
            <SelectItem value="name-desc">{t("shop:nameZA")}</SelectItem>
            <SelectItem value="newest">{t("shop:newest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
