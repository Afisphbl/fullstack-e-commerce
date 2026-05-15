import { useState } from "react";
import { fetchProducts, Product } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from "react-i18next";

interface POSItem {
  product: Product;
  quantity: number;
}

const AdminPOSPage = () => {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<POSItem[]>([]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => fetchProducts({ limit: 100 }),
  });

  const products = productsData?.products || [];

  // Helper function to get localized name for filtering
  const getLocalizedName = (product: Product): string => {
    return product.name || "";
  };

  const filtered = products.filter((p) =>
    getLocalizedName(p).toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const addItem = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { product, quantity: 1 }];
    });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    toast({
      title: t("saleComplete"),
      description: `${t("total")}: ${formatCurrency(total)}`,
    });
    setCart([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">
        {t("pos")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchProducts")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg border border-border p-3"
                  >
                    <Skeleton className="w-full aspect-square rounded-md mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                ))
              : filtered.slice(0, 12).map((p) => {
                  const localizedName = p.name;
                  return (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="bg-card rounded-lg border border-border p-3 text-left hover:shadow-card hover:border-primary/30 transition-all"
                    >
                      <img
                        src={p.image}
                        alt={localizedName}
                        className="w-full aspect-square object-cover rounded-md mb-2"
                      />
                      <p className="text-xs font-medium text-foreground line-clamp-1">
                        {localizedName}
                      </p>
                      <p className="text-sm font-display font-bold text-primary">
                        {formatCurrency(p.price)}
                      </p>
                    </button>
                  );
                })}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 h-fit sticky top-6">
          <h2 className="font-display font-semibold text-foreground mb-4">
            {t("currentSale")}
          </h2>
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("noItemsAdded")}
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {cart.map(({ product, quantity }) => {
                const localizedName = product.name;
                return (
                  <div key={product.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {localizedName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.price)} {t("each")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((i) =>
                              i.product.id === product.id
                                ? {
                                    ...i,
                                    quantity: Math.max(1, i.quantity - 1),
                                  }
                                : i
                            )
                          )
                        }
                        className="p-1 text-muted-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-6 text-center text-foreground">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((i) =>
                              i.product.id === product.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                            )
                          )
                        }
                        className="p-1 text-muted-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-foreground w-16 text-right">
                      {formatCurrency(product.price * quantity)}
                    </span>
                    <button
                      onClick={() =>
                        setCart((prev) =>
                          prev.filter((i) => i.product.id !== product.id)
                        )
                      }
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-border pt-4 mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="text-foreground">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t("tax")} (8%)</span>
              <span className="text-foreground">
                {formatCurrency(total * 0.08)}
              </span>
            </div>
            <div className="flex justify-between font-display font-bold text-lg">
              <span className="text-foreground">{t("total")}</span>
              <span className="text-foreground">
                {formatCurrency(total * 1.08)}
              </span>
            </div>
          </div>
          <Button
            onClick={checkout}
            disabled={cart.length === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            <CreditCard className="h-4 w-4 mr-2" /> {t("completeSale")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPOSPage;
