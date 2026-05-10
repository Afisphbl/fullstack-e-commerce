import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyPaymentStatus } from "@/lib/payment-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle, Clock, Package } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const PaymentSuccessPage = () => {
  usePageTitle("Payment Status");
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await verifyPaymentStatus(orderId);
        setPaymentStatus(response.paymentStatus);
        setOrderStatus(response.orderStatus);
      } catch (err: any) {
        setError(err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Verifying Payment...
            </h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your payment status
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
              Verification Failed
            </h2>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/orders")} variant="outline">
                View Orders
              </Button>
              <Button onClick={() => navigate("/")}>Go Home</Button>
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
            {isPaid && (
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            )}
            {isPending && (
              <Clock className="h-20 w-20 text-yellow-500" />
            )}
            {isFailed && (
              <XCircle className="h-20 w-20 text-destructive" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {isPaid && "Payment Successful!"}
            {isPending && "Payment Pending"}
            {isFailed && "Payment Failed"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isPaid && "Your order has been confirmed and is being processed"}
            {isPending && "Your payment is being processed. This may take a few minutes."}
            {isFailed && "We couldn't process your payment. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <span className={`text-sm font-medium capitalize ${
                isPaid ? "text-green-600 dark:text-green-400" :
                isPending ? "text-yellow-600 dark:text-yellow-400" :
                "text-red-600 dark:text-red-400"
              }`}>
                {paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Status</span>
              <span className="text-sm font-medium capitalize">{orderStatus}</span>
            </div>
          </div>

          {/* Success Message */}
          {isPaid && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    What's Next?
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• You'll receive an order confirmation email shortly</li>
                    <li>• Track your order status in your orders page</li>
                    <li>• We'll notify you when your order ships</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Pending Message */}
          {isPending && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Please wait:</strong> Your payment is being verified. This usually takes a few minutes. 
                You can check your order status in your orders page.
              </p>
            </div>
          )}

          {/* Failed Message */}
          {isFailed && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>Payment failed:</strong> Your payment could not be processed. 
                Please try again or contact support if the problem persists.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link to={`/orders/${orderId}`}>
                View Order Details
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1"
            >
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Support Link */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
