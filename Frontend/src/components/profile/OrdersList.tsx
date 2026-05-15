import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchOrders, Order } from "@/lib/api";
import { OrderCard } from "./OrderCard";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const OrdersList = () => {
  const { t } = useTranslation(["account", "common", "errors"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderGroup, setOrderGroup] = useState<"active" | "completed">(
    "active"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOrders = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to fetch orders")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (orderGroup === "completed") {
      return orders.filter(
        (o) => o.status === "delivered" || o.status === "cancelled"
      );
    }
    return orders.filter(
      (o) =>
        o.status === "placed" ||
        o.status === "processing" ||
        o.status === "shipped"
    );
  }, [orders, orderGroup]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {t("account:tabs.orders")}
        </h2>
        <div className="inline-flex rounded-lg border border-border p-1">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${
              orderGroup === "active"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setOrderGroup("active")}
          >
            {t("account:orders.active")}
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${
              orderGroup === "completed"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setOrderGroup("completed")}
          >
            {t("account:orders.completed")}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-3" />
            <p className="text-destructive font-medium mb-2">
              {t("account:orders.error")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={loadOrders} variant="outline" size="sm">
              {t("common:buttons.retry")}
            </Button>
          </div>
        ) : isLoading ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            {t("account:orders.loading")}
          </p>
        ) : filteredOrders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            {t("account:orders.empty", {
              type:
                orderGroup === "active"
                  ? t("account:orders.active")
                  : t("account:orders.completed"),
            })}
          </p>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </>
  );
};
