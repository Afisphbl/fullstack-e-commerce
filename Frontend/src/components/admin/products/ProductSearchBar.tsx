import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSearchBar = ({ value, onChange }: ProductSearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-card"
      />
    </div>
  );
};
