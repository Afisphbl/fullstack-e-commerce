import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { Order } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from "react-i18next";

const trackerSteps = ["placed", "processing", "shipped", "delivered"];

const getStepIndex = (order: Order) => {
  const timelineStatuses = order.timeline.map((t) => t.status.toLowerCase());
  const latest =
    timelineStatuses[timelineStatuses.length - 1] || order.status.toLowerCase();
  const idx = trackerSteps.indexOf(latest);
  return idx >= 0 ? idx : 0;
};

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const { t } = useTranslation(["account", "common", "shop"]);
  const [isOpen, setIsOpen] = useState(false);
  const stepIndex = getStepIndex(order);

  const statusColors: Record<string, string> = {
    processing: "bg-warning/10 text-warning border-warning/30",
    shipped: "bg-info/10 text-info border-info/30",
    delivered: "bg-success/10 text-success border-success/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("account:orders.toggleDetails", { id: order.id })}
      >
        <div>
          <p className="font-display font-semibold text-foreground">
            {order.id}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("account:orders.placedOn")} {order.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={`${statusColors[order.status] || "bg-muted text-foreground"} border capitalize`}
          >
            {t(`account:orders.status.${order.status}`)}
          </Badge>
          <span className="font-display font-bold text-foreground">
            {formatCurrency(order.total)}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border p-4">
          <div className="mb-5">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              {t("account:orders.progress")}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {trackerSteps.map((step, idx) => (
                <div key={step} className="text-center">
                  <div
                    className={`mx-auto mb-2 h-2.5 w-full rounded-full ${idx <= stepIndex ? "bg-primary" : "bg-muted"}`}
                  />
                  <p
                    className={`text-[11px] uppercase ${idx <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {t(`account:orders.status.${step}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 space-y-2">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-md border border-border p-2.5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("shop:cart.quantity")}: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              {t("checkout:shipping.title")}: {order.shippingAddress}
            </p>
            <p>
              {t("account:orders.tracking")}: {order.trackingNumber || "N/A"}
            </p>
            <p>
              {t("account:orders.estimatedDelivery")}: {order.estimatedDelivery}
            </p>
          </div>
        </div>
      )}
    </article>
  );
};
