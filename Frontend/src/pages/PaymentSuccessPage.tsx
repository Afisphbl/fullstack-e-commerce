import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyPaymentStatus } from "@/lib/payment-api";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle, Clock, Package } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const PaymentSuccessPage = () => {
  const { t } = useTranslation(["checkout", "common", "account"]);
  usePageTitle(t("checkout:payment.title"));
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !loading) return;

    const verifyPayment = async () => {
      try {
        const response = await verifyPaymentStatus(orderId);
        setPaymentStatus(response.paymentStatus);
        setOrderStatus(response.orderStatus);

        if (response.paymentStatus === "paid") {
          clearCart();
        }
      } catch (err) {
        const errorMsg = err as Error;
        setError(errorMsg.message || t("errors:cart.serverError"));
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, clearCart, loading, t]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("checkout:payment.verifying")}
            </h2>
            <p className="text-muted-foreground text-center">
              {t("checkout:payment.confirmingNote")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("checkout:payment.verificationFailed")}
            </h2>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/orders")} variant="outline">
                {t("checkout:success.viewOrders")}
              </Button>
              <Button onClick={() => navigate("/")}>
                {t("common:nav.home")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = paymentStatus === "paid";
  const isPending = paymentStatus === "unpaid" || paymentStatus === "pending";
  const isFailed = paymentStatus === "failed";

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPaid && <CheckCircle2 className="h-20 w-20 text-green-500" />}
            {isPending && <Clock className="h-20 w-20 text-yellow-500" />}
            {isFailed && <XCircle className="h-20 w-20 text-destructive" />}
          </div>
          <CardTitle className="text-3xl">
            {isPaid && t("checkout:payment.successTitle")}
            {isPending && t("checkout:payment.pendingTitle")}
            {isFailed && t("checkout:payment.failedTitle")}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isPaid && t("checkout:payment.successMessage")}
            {isPending && t("checkout:payment.pendingMessage")}
            {isFailed && t("checkout:payment.failedMessage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("checkout:success.orderNumber")}
              </span>
              <span className="font-mono text-sm font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("checkout:payment.title")}
              </span>
              <span
                className={`text-sm font-medium capitalize ${
                  isPaid
                    ? "text-green-600 dark:text-green-400"
                    : isPending
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {t(`checkout:payment.status.${paymentStatus}`)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("account:orders.status.title")}
              </span>
              <span className="text-sm font-medium capitalize">
                {t(`account:orders.status.${orderStatus}`)}
              </span>
            </div>
          </div>

          {isPaid && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    {t("checkout:payment.whatsNext")}
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• {t("checkout:payment.emailNote")}</li>
                    <li>• {t("checkout:payment.trackNote")}</li>
                    <li>• {t("checkout:payment.shipNote")}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>{t("common:buttons.loading")}</strong>{" "}
                {t("checkout:payment.pendingLongMessage")}
              </p>
            </div>
          )}

          {isFailed && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>{t("checkout:payment.failedTitle")}</strong>{" "}
                {t("checkout:payment.failedLongMessage")}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {isFailed ? (
              <>
                <Button asChild variant="default" className="flex-1">
                  <Link to={`/orders/${orderId}`}>
                    {t("checkout:payment.retryPayment")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/orders">{t("checkout:success.viewOrders")}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1">
                  <Link to={`/orders/${orderId}`}>
                    {t("checkout:success.details")}
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/shop">
                    {t("checkout:success.continueShopping")}
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t("checkout:payment.needHelp")}{" "}
              <Link to="/contact" className="text-primary hover:underline">
                {t("common:nav.contact")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
