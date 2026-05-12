import { apiFetch } from "./api-client";

export interface InitializePaymentResponse {
  checkoutUrl: string;
  txRef: string;
  orderId: string;
}

export interface PaymentVerificationResponse {
  paymentStatus: string;
  orderStatus: string;
  paidAt: string | null;
  paymentResult?: {
    id: string;
    status: string;
    method?: string;
    reference?: string;
  };
}

/**
 * Helper interface for payment API responses
 */
export interface PaymentResponse<T> {
  status: string;
  data: T;
}

/**
 * Initialize Chapa payment for an order
 */
export const initializeChapaPayment = async (
  orderId: string,
): Promise<InitializePaymentResponse> => {
  const data = await apiFetch<PaymentResponse<InitializePaymentResponse>>(
    "/api/v1/payments/chapa/initialize",
    {
      method: "POST",
      body: JSON.stringify({ orderId }),
    },
  );
  return data.data;
};

/**
 * Verify payment status for an order
 */
export const verifyPaymentStatus = async (
  orderId: string,
): Promise<PaymentVerificationResponse> => {
  const data = await apiFetch<PaymentResponse<PaymentVerificationResponse>>(
    `/api/v1/payments/verify/${orderId}`,
  );
  return data.data;
};

/**
 * Get supported currencies
 */
export const getSupportedCurrencies = async () => {
  const data = await apiFetch<
    PaymentResponse<{ success: boolean; currencies: string[] }>
  >("/api/v1/payments/currencies");
  return data.data;
};

/**
 * Get banks list
 */
export const getBanksList = async () => {
  const data = await apiFetch<
    PaymentResponse<{ success: boolean; banks: Record<string, unknown>[] }>
  >("/api/v1/payments/banks");
  return data.data;
};
