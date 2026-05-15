import { Product } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

interface ProductSpecificationsProps {
  product: Product;
}

export const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const { t } = useTranslation('product');
  const getLocalizedField = useLocalizedField();
  
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h3 className="text-xl font-display font-semibold text-foreground mb-6">
        {t('specifications')}
      </h3>
      <div className="space-y-6">
        {product.specification ? (
          // Grouped Specifications from Backend
          product.specification.details.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider">
                {getLocalizedField(group.group)}
              </h4>
              <div className="space-y-2">
                {group.specs.map((spec, specIdx) => (
                  <div
                    key={specIdx}
                    className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-muted-foreground">{getLocalizedField(spec.name)}</span>
                    <span className="font-medium text-foreground">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Fallback to flat specs (attributes)
          <div className="space-y-3">
            {Object.entries(product.specs).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between text-sm py-2 border-b border-border last:border-0"
              >
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
