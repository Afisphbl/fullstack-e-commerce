import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { fetchOrders, Order } from "@/lib/api";
import { User, Package, Heart, MapPin, ChevronDown, Lock, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type AccountTab = "profile" | "password" | "orders" | "wishlist";

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

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Please enter a valid email address"),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

const updatePasswordSchema = z
  .object({
    passwordCurrent: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    passwordConfirm: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "New passwords do not match",
    path: ["passwordConfirm"],
  });

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderGroup, setOrderGroup] = useState<"active" | "completed">("active");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const { favorites } = useFavorites();
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.role === "user") {
      fetchOrders().then(setOrders).catch(() => {});
    }
  }, [user?.role]);

  useEffect(() => {
    const tab = searchParams.get("tab") as AccountTab;
    if (tab === "orders" || tab === "wishlist" || tab === "profile" || tab === "password") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });

  useEffect(() => {
    if (user) {
      const address = user.addresses?.[0] || {};
      profileForm.reset({
        name: user.name,
        email: user.email,
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
        country: address.country || "",
      });
    }
  }, [user, profileForm]);

  const passwordForm = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      passwordCurrent: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: z.infer<typeof updateProfileSchema>) => {
      const payload: any = {
        name: values.name,
        email: values.email,
      };
      
      // Send addresses array if any address field is filled, or if they just want to save
      if (values.street || values.city || values.state || values.zip || values.country) {
        const existingAddresses = user?.addresses || [];
        const existingAddress = existingAddresses[0] || {};
        
        const updatedFirstAddress = {
          ...existingAddress,
          street: values.street || "",
          city: values.city || "",
          state: values.state || "",
          zip: values.zip || "",
          country: values.country || "",
        };

        payload.addresses = existingAddresses.length > 0
          ? [updatedFirstAddress, ...existingAddresses.slice(1)]
          : [updatedFirstAddress];
      }

      return apiFetch("/api/v1/users/updateMe", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      queryClient.setQueryData(["currentUser"], data.data.user);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (values: z.infer<typeof updatePasswordSchema>) =>
      apiFetch("/api/v1/auth/updateMyPassword", {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      toast.success("Password updated successfully!");
      queryClient.setQueryData(["currentUser"], data.data.user);
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/v1/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.setQueryData(["currentUser"], null);
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredOrders = useMemo(() => {
    if (orderGroup === "completed") {
      return orders.filter(
        (o) => o.status === "delivered" || o.status === "cancelled",
      );
    }
    return orders.filter(
      (o) => o.status === "placed" || o.status === "processing" || o.status === "shipped",
    );
  }, [orders, orderGroup]);

  if (isLoading || !user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  const sidebarItems = [
    { key: "profile" as const, icon: User, label: "Profile" },
    { key: "password" as const, icon: Lock, label: "Password" },
  ];

  if (user.role === "user") {
    sidebarItems.push({ key: "orders" as const, icon: Package, label: "Orders" });
    sidebarItems.push({ key: "wishlist" as const, icon: Heart, label: "Wishlist" });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          My Profile
        </h1>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>

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
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit((values) =>
                  updateProfileMutation.mutate(values)
                )}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Personal Information */}
                  <div className="space-y-4">
                    <h2 className="font-display font-semibold text-foreground mb-6 text-xl">
                      Personal Information
                    </h2>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {user.photo !== 'default.jpg' ? (
                          <img src={`/public/img/users/${user.photo}`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (

                          <User className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="mt-1 uppercase text-[10px]">{user.role}</Badge>
                      </div>
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column: Shipping Details (Users Only) */}
                  {user.role === "user" && (
                    <div className="space-y-4">
                      <h2 className="font-display font-semibold text-foreground mb-6 text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" /> Shipping Details
                      </h2>
                      
                      <FormField
                        control={profileForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end border-t border-border pt-6">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {activeTab === "password" && (
            <>
              <h2 className="font-display font-semibold text-foreground mb-6 text-xl">
                Change Password
              </h2>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit((values) =>
                    updatePasswordMutation.mutate(values)
                  )}
                  className="space-y-4 max-w-md"
                >
                  <FormField
                    control={passwordForm.control}
                    name="passwordCurrent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={updatePasswordMutation.isPending} className="mt-4">
                    {updatePasswordMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </Button>
                </form>
              </Form>
            </>
          )}

          {activeTab === "orders" && user.role === "user" && (
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

          {activeTab === "wishlist" && user.role === "user" && (
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
