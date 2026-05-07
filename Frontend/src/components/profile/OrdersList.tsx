import { useEffect, useState, useMemo } from "react";
import { fetchOrders, Order } from "@/lib/api";
import { OrderCard } from "./OrderCard";

export const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderGroup, setOrderGroup] = useState<"active" | "completed">(
    "active"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

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
          Orders
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
            Active
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
            Completed
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Loading orders...
          </p>
        ) : filteredOrders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            No {orderGroup} orders found.
          </p>
        ) : (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </>
  );
};
