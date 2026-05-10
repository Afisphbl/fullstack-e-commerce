import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/api";
import { initializeChapaPayment } from "@/lib/payment-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CreditCard, Check, Loader2, Smartphone, Building2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const CheckoutPage = () => {
  usePageTitle("Checkout");
  const { items, total, subtotal, discount, couponCode, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
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

  // Pre-fill user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Split name into first and last name
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Get default address if available
      const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast.error("Please log in to place an order");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // Determine payment method based on selection
      let orderPaymentMethod = paymentMethod;
      if (paymentMethod === "chapa_cbe") {
        orderPaymentMethod = "chapa_cbe";
      } else if (paymentMethod === "chapa_telebirr") {
        orderPaymentMethod = "chapa_telebirr";
      }

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
        paymentMethod: orderPaymentMethod,
        itemsPrice: subtotal || total,
      };

      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse.data.order._id;

      // If Chapa payment method, initialize payment
      if (paymentMethod === "chapa_cbe" || paymentMethod === "chapa_telebirr") {
        toast.success("Order created! Redirecting to payment...");
        
        try {
          const paymentResponse = await initializeChapaPayment(orderId);
          
          // Redirect to Chapa checkout
          window.location.href = paymentResponse.checkoutUrl;
        } catch (paymentError: any) {
          console.error('Payment initialization error:', paymentError);
          const errorMessage = paymentError?.message || paymentError?.toString() || "Failed to initialize payment";
          toast.error(errorMessage);
          navigate(`/orders/${orderId}`);
        }
      } else {
        // For other payment methods, just show success
        toast.success("Order placed successfully! Check your email for confirmation.");
        clearCart();
        navigate("/orders");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
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
        Checkout
      </h1>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {["Shipping", "Payment", "Review"].map((label, i) => (
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
                Shipping Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">First Name</Label>
                  <Input
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Last Name</Label>
                  <Input
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="text-foreground">Phone Number</Label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for Telebirr payments (format: 09xxxxxxxx)
                </p>
              </div>
              <div>
                <Label className="text-foreground">Address</Label>
                <Input
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-foreground">City</Label>
                  <Input
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-foreground">State</Label>
                  <Input
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-foreground">ZIP</Label>
                  <Input
                    name="zip"
                    value={shippingInfo.zip}
                    onChange={handleInputChange}
                    required
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Payment Method
              </h2>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {/* Chapa Telebirr */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="chapa_telebirr" id="chapa_telebirr" />
                  <Label
                    htmlFor="chapa_telebirr"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Telebirr</p>
                      <p className="text-sm text-muted-foreground">
                        Pay with Telebirr mobile money
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Chapa CBE */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="chapa_cbe" id="chapa_cbe" />
                  <Label
                    htmlFor="chapa_cbe"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">CBE Birr</p>
                      <p className="text-sm text-muted-foreground">
                        Pay with Commercial Bank of Ethiopia
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Credit/Debit Card */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label
                    htmlFor="card"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">
                        Pay with Visa, Mastercard, or other cards
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Show card details only if card is selected */}
              {paymentMethod === "card" && (
                <div className="space-y-4 mt-6 pt-6 border-t border-border">
                  <h3 className="font-medium text-foreground">Card Details</h3>
                  <div>
                    <Label className="text-foreground">Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground">Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">CVC</Label>
                      <Input placeholder="123" required className="bg-background" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground">Name on Card</Label>
                    <Input required className="bg-background" />
                  </div>
                </div>
              )}

              {/* Info for Chapa payments */}
              {(paymentMethod === "chapa_cbe" || paymentMethod === "chapa_telebirr") && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Note:</strong> You will be redirected to Chapa's secure payment page to complete your {paymentMethod === "chapa_telebirr" ? "Telebirr" : "CBE Birr"} payment.
                  </p>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="font-display font-semibold text-foreground mb-4">
                Order Review
              </h2>
              <div className="space-y-3 mb-6">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Info Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Shipping To:</h3>
                <p className="text-sm text-muted-foreground">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{shippingInfo.email}</p>
                <p className="text-sm text-muted-foreground">
                  {shippingInfo.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                </p>
                <p className="text-sm text-muted-foreground">{shippingInfo.country}</p>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing
                  Order...
                </>
              ) : step < 3 ? (
                "Continue"
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" /> Place Order — $
                  {grandTotal.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 h-fit">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
              <span className="text-foreground">${(subtotal || total).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount {couponCode && `(${couponCode})`}</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal after discount</span>
                  <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-display font-bold text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Cart Items Preview */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Items in Cart</h4>
            <div className="space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quantity} × ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
