import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSearchBar = ({
  value,
  onChange,
}: ProductSearchBarProps) => {
  const { t } = useTranslation("admin");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t("searchProducts")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-card"
      />
    </div>
  );
};
