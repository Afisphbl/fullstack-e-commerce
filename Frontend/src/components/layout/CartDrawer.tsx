import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  Loader2,
  Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Skeleton loader component for cart items
const CartItemSkeleton = () => (
  <div className="rounded-lg border border-border bg-card p-3 animate-fade-in">
    <div className="flex gap-3">
      <Skeleton className="h-16 w-16 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>
);

export const CartDrawer = () => {
  const { t } = useTranslation("shop");
  const {
    items,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    subtotal,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    itemCount,
    closeCart,
    isLoading,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  const shipping = total > 100 || total === 0 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border p-6 pb-4 text-left">
          <SheetTitle className="flex items-center justify-between">
            <span>{t("cart.title")}</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {itemCount} {itemCount === 1 ? t("cart.item") : t("cart.items")}
            </span>
          </SheetTitle>
          <SheetDescription>{t("cart.empty")}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="status"
            aria-live="polite"
            aria-label="Loading cart items"
          >
            <CartItemSkeleton key="skeleton-1" />
            <CartItemSkeleton key="skeleton-2" />
            <CartItemSkeleton key="skeleton-3" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="mb-4 h-14 w-14 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold text-foreground">
              {t("cart.empty")}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {t("cart.emptyHint")}
            </p>
            <Button onClick={closeCart} asChild>
              <Link to="/shop">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-border bg-card p-3 animate-fade-in transition-all duration-300 ease-in-out hover:shadow-md"
                >
                  <div className="flex gap-3">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={closeCart}
                      className="h-16 w-16 overflow-hidden rounded-md transition-transform duration-200 hover:scale-105"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name} from cart`}
                          className="text-muted-foreground transition-all duration-200 hover:text-destructive hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {product.brand}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-border transition-all duration-200 hover:border-primary">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className="px-2 text-sm font-medium text-foreground transition-all duration-300"
                            aria-live="polite"
                            aria-label={`Quantity: ${quantity}`}
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            aria-label={`Increase quantity of ${product.name}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span
                          className="text-sm font-bold text-foreground transition-all duration-300"
                          aria-live="polite"
                          aria-label={`Item total: ${formatCurrency(product.price * quantity)}`}
                        >
                          {formatCurrency(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              {/* Coupon Input Section */}
              {!couponCode && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t("cart.coupon.placeholder")}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyCoupon();
                        }}
                        className="pl-9"
                        disabled={isApplyingCoupon}
                      />
                    </div>
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || isApplyingCoupon}
                      className="min-w-[80px]"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("cart.coupon.apply")
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Applied Coupon Display */}
              {couponCode && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {couponCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    {t("cart.coupon.remove")}
                  </button>
                </div>
              )}

              <div className="mb-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("cart.subtotal")}
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(subtotal || total)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{t("cart.coupon.discount")}</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("checkout:order.shipping")}
                  </span>
                  <span className="text-foreground">
                    {shipping === 0
                      ? t("checkout:order.freeShipping")
                      : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("checkout:order.tax")}
                  </span>
                  <span className="text-foreground">{formatCurrency(tax)}</span>
                </div>
              </div>
              <div className="mb-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold text-foreground">
                  {t("cart.total")}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                >
                  <Trash2 className="mr-2 h-4 w-4" />{" "}
                  {t("common:buttons.delete")}
                </Button>
                <Button asChild className="flex-1" onClick={closeCart}>
                  <Link to="/checkout">{t("cart.checkout")}</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
