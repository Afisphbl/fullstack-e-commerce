import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Check } from "lucide-react";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    toast({
      title: "Order Placed!",
      description:
        "Your order has been placed successfully. Check your email for confirmation.",
    });
    clearCart();
    navigate("/orders");
  };

  if (items.length === 0) {
    navigate("/shop");
    return null;
  }

  const grandTotal = total + (total > 100 ? 0 : 9.99) + total * 0.08;

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
                  <Input required className="bg-background" />
                </div>
                <div>
                  <Label className="text-foreground">Last Name</Label>
                  <Input required className="bg-background" />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Email</Label>
                <Input type="email" required className="bg-background" />
              </div>
              <div>
                <Label className="text-foreground">Address</Label>
                <Input required className="bg-background" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-foreground">City</Label>
                  <Input required className="bg-background" />
                </div>
                <div>
                  <Label className="text-foreground">State</Label>
                  <Input required className="bg-background" />
                </div>
                <div>
                  <Label className="text-foreground">ZIP</Label>
                  <Input required className="bg-background" />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Payment Details
              </h2>
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
          {step === 3 && (
            <div>
              <h2 className="font-display font-semibold text-foreground mb-4">
                Order Review
              </h2>
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
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
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
            >
              {step < 3 ? (
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
            Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Items ({items.length})
              </span>
              <span className="text-foreground">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {total > 100 ? "Free" : "$9.99"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">
                ${(total * 0.08).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-display font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
