import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductPageHeaderProps {
  totalProducts: number;
  onAddProduct: () => void;
}

export const ProductPageHeader = ({
  totalProducts,
  onAddProduct,
}: ProductPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-display font-bold text-foreground">
        Products ({totalProducts})
      </h1>
      <Button
        onClick={onAddProduct}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Product
      </Button>
    </div>
  );
};
