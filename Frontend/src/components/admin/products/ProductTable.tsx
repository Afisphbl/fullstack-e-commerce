import { Product } from "@/lib/api";
import { ProductTableRow } from "./ProductTableRow";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("admin");
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] md:min-w-0">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                {t("products")}
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                {t("price")}
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                {t("stock")}
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                {t("category")}
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                {t("status")}
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {t("noProductsFound")}
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
    </div>
  );
};
