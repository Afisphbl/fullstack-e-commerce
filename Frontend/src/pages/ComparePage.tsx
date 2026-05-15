import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { X, GitCompare } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/usePageTitle";
import { extractLocalizedField } from "@/hooks/useLocalizedField";

const ComparePage = () => {
  const { t, i18n } = useTranslation(["compare", "product"]);
  const lang = i18n.language as "am" | "en" | "om";
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  usePageTitle(t("compare:title"));

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          {t("compare:noProducts")}
        </h1>
        <p className="text-muted-foreground mb-6">{t("compare:description")}</p>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link to="/shop">{t("compare:browse")}</Link>
        </Button>
      </div>
    );
  }

  const allSpecKeys = [
    ...new Set(compareList.flatMap((p) => Object.keys(p.specs))),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          {t("compare:title")}
        </h1>
        <Button
          variant="outline"
          onClick={clearCompare}
          className="text-destructive border-destructive/30"
        >
          {t("compare:clearAll")}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                {t("compare:feature")}
              </th>
              {compareList.map((p) => (
                <th
                  key={p.id}
                  className="p-4 text-center min-w-[200px] relative"
                >
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    aria-label={`${t("compare:remove")} ${p.name}`}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link to={`/product/${p.slug}`} className="block group">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-3 group-hover:scale-105 transition-transform"
                    />
                    <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      {p.name}
                    </p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="p-4 text-sm text-muted-foreground">
                {t("compare:price")}
              </td>
              {compareList.map((p) => (
                <td
                  key={p.id}
                  className="p-4 text-center font-display font-bold text-foreground"
                >
                  ${p.price}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <td className="p-4 text-sm text-muted-foreground">
                {t("compare:brand")}
              </td>
              {compareList.map((p) => (
                <td key={p.id} className="p-4 text-center text-foreground">
                  {p.brand}
                </td>
              ))}
            </tr>
            {allSpecKeys.map((key) => (
              <tr key={key} className="border-t border-border even:bg-card">
                <td className="p-4 text-sm text-muted-foreground">
                  {extractLocalizedField(key, lang)}
                </td>
                {compareList.map((p) => (
                  <td
                    key={p.id}
                    className="p-4 text-center text-sm text-foreground"
                  >
                    {extractLocalizedField(p.specs[key], lang) || "—"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="p-4" />
              {compareList.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <Button
                    onClick={() => addToCart(p)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {t("compare:addToCart")}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
