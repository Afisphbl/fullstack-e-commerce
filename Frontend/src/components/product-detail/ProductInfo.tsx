import { Badge } from "@/components/ui/badge";
import { Star as StarIcon } from "lucide-react";
import { Product } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.ratingsAverage)
                    ? "fill-primary text-primary"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground ml-1">
            {product.ratingsAverage}
          </span>
        </div>
        <span className="text-sm text-muted-foreground border-l border-border pl-4">
          {product.ratingsQuantity} Reviews
        </span>
        <span className="text-sm text-muted-foreground border-l border-border pl-4">
          {product.sold} Sold
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-display font-bold text-foreground">
          {formatCurrency(product.price)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
            <Badge className="bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          </>
        )}
      </div>

      <div className="text-muted-foreground mb-6 leading-relaxed space-y-2">
        {product.description
          ?.split(/\.(?!\d)/)
          .filter((s) => s.trim())
          .map((sentence, i) => (
            <p key={i}>{sentence.trim()}.</p>
          ))}
      </div>

      <div className="flex items-center gap-1 mb-2 text-sm">
        <span
          className={`font-medium ${
            product.stock > 10
              ? "text-success"
              : product.stock > 0
                ? "text-warning"
                : "text-destructive"
          }`}
        >
          {product.stock > 10
            ? "In Stock"
            : product.stock > 0
              ? `Only ${product.stock} left`
              : "Out of Stock"}
        </span>
      </div>
    </div>
  );
};
