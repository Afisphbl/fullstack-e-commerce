import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShopHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export const ShopHeader = ({ search, onSearchChange }: ShopHeaderProps) => {
  const { t } = useTranslation(["shop"]);
  return (
    <>
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        {t("shop:title") || "Shop Electronics"}
      </h1>

      <div className="mb-8">
        <div className="relative max-w-3xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              t("shop:searchPlaceholder") ||
              "Search products, brands, or specs..."
            }
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 bg-card pl-10"
          />
        </div>
      </div>
    </>
  );
};
