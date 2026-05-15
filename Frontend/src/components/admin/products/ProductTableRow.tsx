import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Product } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductTableRow = ({
  product,
  onEdit,
  onDelete,
}: ProductTableRowProps) => {
  // Extract localized values at the component level (not inside render)
  const localizedName = typeof product.name === 'string'
    ? product.name
    : product.name?.en || product.name?.am || product.name?.om || '';
  const localizedCategoryName = typeof product.category === "object"
    ? (typeof product.category.name === 'string'
        ? product.category.name
        : product.category.name?.en || product.category.name?.am || product.category.name?.om || '')
    : product.category;
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      onDelete(product.id);
    }
  };

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={product.imageCover || product.image}
            alt={localizedName}
            className="w-10 h-10 rounded-lg object-cover bg-muted"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {localizedName}
            </p>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm font-medium text-foreground">
          {formatCurrency(product.price)}
        </div>
        {product.originalPrice && product.originalPrice !== product.price && (
          <div className="text-xs text-muted-foreground line-through">
            {formatCurrency(product.originalPrice)}
          </div>
        )}
      </td>
      <td className="p-4">
        <Badge
          variant={product.stock > 10 ? "secondary" : "destructive"}
          className="font-mono"
        >
          {product.stock}
        </Badge>
      </td>
      <td className="p-4 text-sm text-muted-foreground capitalize">
        {localizedCategoryName}
      </td>
      <td className="p-4">
        <Badge variant="outline" className="capitalize">
          {(product as { status?: string }).status || "active"}
        </Badge>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(product)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
