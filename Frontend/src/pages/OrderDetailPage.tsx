import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchOrderById, Order } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MapPin, Package } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/formatters";

const OrderDetailPage = () => {
  const { t } = useTranslation(["account", "checkout", "common", "shop"]);
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    processing: "bg-warning/10 text-warning border-warning/30",
    shipped: "bg-info/10 text-info border-info/30",
    delivered: "bg-success/10 text-success border-success/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderById(id);
      setOrder(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("account:orders.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner label={t("account:orders.loading")} />
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">
            {t("account:orders.error")}
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={loadOrder}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("common:buttons.retry")}
          </button>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{t("account:orders.notFound")}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> {t("account:orders.backToOrders")}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {order.id}
        </h1>
        <Badge className={`${statusColors[order.status]} border capitalize`}>
          {t(`account:orders.status.${order.status}`)}
        </Badge>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h2 className="font-display font-semibold text-foreground mb-4">
          {t("checkout:order.items")}
        </h2>
        {order.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 py-3 border-b border-border last:border-0"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("shop:cart.quantity")}: {item.quantity}
              </p>
            </div>
            <span className="font-display font-bold text-foreground">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-4 mt-4 flex justify-between">
          <span className="font-display font-semibold text-foreground">
            {t("checkout:order.total")}
          </span>
          <span className="font-display font-bold text-foreground text-lg">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />{" "}
            {t("checkout:shipping.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress}
          </p>
          {order.trackingNumber && (
            <p className="text-sm text-muted-foreground mt-2">
              {t("account:orders.tracking")}: {order.trackingNumber}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {t("account:orders.estimatedDelivery")}: {order.estimatedDelivery}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />{" "}
            {t("account:orders.progress")}
          </h3>
          <div className="space-y-3">
            {order.timeline.map((t_item, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === order.timeline.length - 1 ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t_item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{t_item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
