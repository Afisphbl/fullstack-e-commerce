import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchOrderById, Order } from "@/lib/api";
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const TrackOrderPage = () => {
  const { t } = useTranslation(["account", "checkout", "common"]);
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trackingSteps = [
    { key: "ordered", label: t("account:orders.status.placed"), icon: Package },
    {
      key: "confirmed",
      label: t("account:orders.status.processing"),
      icon: CheckCircle,
    },
    { key: "shipped", label: t("account:orders.status.shipped"), icon: Truck },
    {
      key: "in-transit",
      label: t("account:orders.status.shipped"),
      icon: Truck,
    },
    {
      key: "delivered",
      label: t("account:orders.status.delivered"),
      icon: MapPin,
    },
  ];

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

  const completedStatuses = order.timeline.map((t_item) => t_item.status);
  const currentStepIndex = trackingSteps.findIndex(
    (s) => s.key === completedStatuses[completedStatuses.length - 1]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> {t("account:orders.backToOrders")}
      </Link>

      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        {t("account:orders.trackOrder")}
      </h1>
      <p className="text-muted-foreground mb-8">
        {order.id} {order.trackingNumber && `• ${order.trackingNumber}`}
      </p>

      <div className="bg-card rounded-lg border border-border p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          {trackingSteps.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="flex flex-col items-center flex-1 relative"
              >
                {i > 0 && (
                  <div
                    className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${i <= currentStepIndex ? "bg-primary" : "bg-border"}`}
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs text-center ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock className="h-4 w-4" /> {t("account:orders.estimatedDelivery")}:{" "}
          <span className="text-foreground font-medium">
            {order.estimatedDelivery}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">
          {t("account:orders.progress")}
        </h2>
        <div className="space-y-4">
          {[...order.timeline].reverse().map((t_item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary animate-glow" : "bg-muted-foreground/30"}`}
                />
                {i < order.timeline.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-1" />
                )}
              </div>
              <div className="pb-4">
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
  );
};

export default TrackOrderPage;
