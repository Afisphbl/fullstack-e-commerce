import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Product } from "@/lib/api";
import { ProductTableRow } from "./ProductTableRow";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductTable = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Product
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Price
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Stock
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Category
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-right p-4 text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={6}>
                <LoadingSpinner label="Loading products..." />
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="p-8 text-center text-muted-foreground"
              >
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
