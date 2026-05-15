import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { createOrder, fetchGeneralSettings } from "@/lib/api";
import { initializeChapaPayment } from "@/lib/payment-api";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CreditCard,
  Check,
  Loader2,
  Smartphone,
  Building2,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const CheckoutPage = () => {
  const { t } = useTranslation(["checkout", "cart"]);
  usePageTitle(t("checkout:checkout"));
  const { items, total, subtotal, discount, couponCode, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod] = useState<string>("chapa");
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Ethiopia",
  });
  const [allowedCities, setAllowedCities] = useState<string[]>([]);
  const [restrictionEnabled, setRestrictionEnabled] = useState(false);

  // Pre-fill user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Split name into first and last name
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Get default address if available
      const defaultAddress =
        user.addresses?.find((addr) => addr.isDefault) || user.addresses?.[0];

      setShippingInfo({
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || "",
        address: defaultAddress?.street || "",
        city: defaultAddress?.city || "",
        state: defaultAddress?.state || "",
        zip: defaultAddress?.zip || "",
        country: defaultAddress?.country || "Ethiopia",
      });
    }
  }, [user]);

  useEffect(() => {
    fetchGeneralSettings()
      .then((settings) => {
        if (settings?.enableLocationRestriction) {
          setRestrictionEnabled(true);
          const cities = settings.allowedDeliveryCities || [];
          setAllowedCities(cities);

          // Ensure starting city is valid if restriction is enabled
          setShippingInfo((prev) => {
            if (
              cities.length > 0 &&
              !cities.some(
                (c: string) => c.toLowerCase() === prev.city.toLowerCase()
              )
            ) {
              return { ...prev, city: cities[0] };
            }
            return prev;
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error(
        t("auth:pleaseLoginToOrder") || "Please log in to place an order"
      );
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: items.map((i) => ({
          product: i.product.id,
          quantity: i.quantity,
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip: shippingInfo.zip,
          country: shippingInfo.country,
        },
        paymentMethod: paymentMethod,
        itemsPrice: subtotal || total,
      };

      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse.data.data._id;

      // Initialize Chapa payment
      toast.success("Order created! Redirecting to payment...");

      try {
        const paymentResponse = await initializeChapaPayment(orderId);

        // Redirect to Chapa checkout - clear cart will happen after successful redirection/return
        window.location.href = paymentResponse.checkoutUrl;
      } catch (error) {
        console.error("Payment initialization error:", error);
        const errorMessage =
          (error as Error).message || "Failed to initialize payment";
        toast.error(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/shop");
    return null;
  }

  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        {t("checkout:checkout")}
      </h1>

      {/* Steps Visualization */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          t("checkout:shipping"),
          t("checkout:payment"),
          t("checkout:review"),
        ].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {i < 2 && (
              <div
                className={`w-12 h-0.5 ${i + 1 < step ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-foreground mb-4">
                {t("checkout:shippingInformation")}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t("checkout:firstName")}
                  </Label>
                  <Input
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t("checkout:lastName")}
                  </Label>
                  <Input
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  {t("checkout:emailAddress")}
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  {t("checkout:phoneNumber")}
                </Label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("checkout:phoneRequiredTip")}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  {t("checkout:streetAddress")}
                </Label>
                <Input
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t("checkout:city")}
                  </Label>
                  {restrictionEnabled && allowedCities.length > 0 ? (
                    <select
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {allowedCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t("checkout:state")}
                  </Label>
                  <Input
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">{t("checkout:zip")}</Label>
                  <Input
                    name="zip"
                    value={shippingInfo.zip}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="mb-4">
                <h2 className="font-display font-semibold text-2xl text-foreground mb-2">
                  {t("checkout:securePayment")}
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {t("checkout:securePaymentDesc")}
                </p>
              </div>

              <div className="bg-card border-2 border-primary rounded-2xl p-8 transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {t("checkout:chapaGateway")}
                      </h3>
                      <p className="text-xs text-muted-foreground italic">
                        {t("checkout:officialPartner")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-1 rounded">
                    {t("checkout:recommended")}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-muted/50 rounded-xl w-full flex justify-center">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      {t("checkout:telebirr")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-muted/50 rounded-xl w-full flex justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      {t("checkout:cbeBirr")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-muted/50 rounded-xl w-full flex justify-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      {t("checkout:visaMaster")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-muted/50 rounded-xl w-full flex justify-center">
                      <Check className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      {t("checkout:andMore")}
                    </span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-left">
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                    {t("checkout:chapaRedirectDesc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-foreground mb-4 text-xl">
                {t("checkout:orderReview")}
              </h2>
              <div className="space-y-3 mb-6">
                {items.map(({ product, quantity }) => {
                  const localizedName =
                    typeof product.name === "string"
                      ? product.name
                      : product.name?.en ||
                        product.name?.am ||
                        product.name?.om ||
                        "";
                  return (
                    <div
                      key={product.id}
                      className="flex gap-4 py-3 border-b border-border last:border-0"
                    >
                      <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={localizedName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {localizedName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("checkout:quantity")}: {quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(product.price * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                <h3 className="text-xs font-black uppercase text-foreground mb-3 tracking-widest">
                  {t("checkout:shippingDestination")}
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">
                    {shippingInfo.firstName} {shippingInfo.lastName}
                  </p>
                  <p>{shippingInfo.address}</p>
                  <p>
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                  </p>
                  <p className="pt-2">{shippingInfo.phone}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                className="px-8"
                onClick={() => setStep(step - 1)}
              >
                {t("checkout:back")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-tight shadow-neon"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                  {t("checkout:working")}
                </>
              ) : step < 3 ? (
                t("checkout:continueToPayment")
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />{" "}
                  {t("checkout:placeOrder", {
                    total: formatCurrency(grandTotal),
                  })}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 h-fit sticky top-24">
          <h3 className="font-display font-semibold text-foreground mb-6 text-lg border-b border-border pb-2">
            {t("checkout:summary")}
          </h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("checkout:itemsPrice")}
              </span>
              <span className="text-foreground font-medium">
                {formatCurrency(subtotal || total)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>{t("cart:discount")}</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("cart:shipping")}
              </span>
              <span className="text-foreground font-medium">
                {shipping === 0 ? t("cart:free") : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("checkout:estimatedTax")}
              </span>
              <span className="text-foreground font-medium">
                {formatCurrency(tax)}
              </span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-display font-bold text-xl">
              <span className="text-foreground">{t("cart:total")}</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">
              {t("checkout:cartPreview")}
            </div>
            {items.slice(0, 3).map(({ product, quantity }) => {
              const localizedName =
                typeof product.name === "string"
                  ? product.name
                  : product.name?.en ||
                    product.name?.am ||
                    product.name?.om ||
                    "";
              return (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {localizedName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {quantity} {t("checkout:units")}
                    </p>
                  </div>
                </div>
              );
            })}
            {items.length > 3 && (
              <p className="text-[10px] text-center text-muted-foreground">
                {t("checkout:moreItems", { count: items.length - 3 })}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
