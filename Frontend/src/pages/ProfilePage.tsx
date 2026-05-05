import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { fetchOrders, Order } from "@/lib/api";
import { User, Package, Heart, MapPin, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type AccountTab = "profile" | "orders" | "wishlist";

const statusColors: Record<string, string> = {
  processing: "bg-warning/10 text-warning border-warning/30",
  shipped: "bg-info/10 text-info border-info/30",
  delivered: "bg-success/10 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const trackerSteps = ["placed", "processing", "shipped", "delivered"];

const getStepIndex = (order: Order) => {
  const timelineStatuses = order.timeline.map((t) => t.status.toLowerCase());
  const latest =
    timelineStatuses[timelineStatuses.length - 1] || order.status.toLowerCase();
  const idx = trackerSteps.indexOf(latest);
  return idx >= 0 ? idx : 0;
};

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderGroup, setOrderGroup] = useState<"active" | "completed">(
    "active",
  );
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const { favorites } = useFavorites();

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders" || tab === "wishlist" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const filteredOrders = useMemo(() => {
    if (orderGroup === "completed") {
      return orders.filter(
        (o) => o.status === "delivered" || o.status === "cancelled",
      );
    }
    return orders.filter(
      (o) => o.status === "processing" || o.status === "shipped",
    );
  }, [orders, orderGroup]);

  const sidebarItems = [
    { key: "profile" as const, icon: User, label: "Profile" },
    { key: "orders" as const, icon: Package, label: "Orders" },
    { key: "wishlist" as const, icon: Heart, label: "Wishlist" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-8">
        <aside className="space-y-2 self-start md:sticky md:top-24">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setSearchParams(key === "profile" ? {} : { tab: key });
              }}
              className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${activeTab === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
        </aside>

        <section className="bg-card rounded-lg border border-border p-6">
          {activeTab === "profile" && (
            <>
              <h2 className="font-display font-semibold text-foreground mb-6">
                Personal Information
              </h2>
              <form className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">John Doe</h3>
                    <p className="text-sm text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">First Name</Label>
                    <Input defaultValue="John" className="bg-background" />
                  </div>
                  <div>
                    <Label className="text-foreground">Last Name</Label>
                    <Input defaultValue="Doe" className="bg-background" />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Email</Label>
                  <Input
                    type="email"
                    defaultValue="john@example.com"
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Phone</Label>
                  <Input
                    defaultValue="+1 (555) 123-4567"
                    className="bg-background"
                  />
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="mb-4 inline-flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> Shipping Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-foreground">Street Address</Label>
                      <Input
                        defaultValue="123 Innovation Drive"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">City</Label>
                      <Input
                        defaultValue="San Francisco"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">State</Label>
                      <Input defaultValue="CA" className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-foreground">Postal Code</Label>
                      <Input defaultValue="94105" className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-foreground">Country</Label>
                      <Input
                        defaultValue="United States"
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>

                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Save Changes
                </Button>
              </form>
            </>
          )}

          {activeTab === "orders" && (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Orders
                </h2>
                <div className="inline-flex rounded-lg border border-border p-1">
                  <button
                    className={`rounded-md px-3 py-1.5 text-sm ${orderGroup === "active" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setOrderGroup("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 text-sm ${orderGroup === "completed" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setOrderGroup("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                    No {orderGroup} orders found.
                  </p>
                )}

                {filteredOrders.map((order) => {
                  const isOpen = openOrderId === order.id;
                  const stepIndex = getStepIndex(order);

                  return (
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-lg border border-border bg-background"
                    >
                      <button
                        className="flex w-full items-center justify-between gap-4 p-4 text-left"
                        onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                        aria-label={`Toggle details for order ${order.id}`}
                      >
                        <div>
                          <p className="font-display font-semibold text-foreground">
                            {order.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Placed on {order.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${statusColors[order.status] || "bg-muted text-foreground"} border capitalize`}
                          >
                            {order.status}
                          </Badge>
                          <span className="font-display font-bold text-foreground">
                            ${order.total.toFixed(2)}
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
                              Order Progress
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
                                    {step}
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
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <p>Shipping: {order.shippingAddress}</p>
                            <p>Tracking: {order.trackingNumber || "N/A"}</p>
                            <p>Estimated Delivery: {order.estimatedDelivery}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "wishlist" && (
            <>
              <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
                My Wishlist ({favorites.length})
              </h2>
              {favorites.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  Your wishlist is empty. Save items to view them here.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {favorites.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
