import { apiFetch } from "@/lib/api-client";

type PaypalLink = {
  href: string;
  rel: string;
  method: string;
};

export type PaypalCreateOrderRes = {
  id: string;
  status: string;
  links: PaypalLink[];
};

export async function createPaypalOrder(amountUsd: number) {
  return apiFetch<PaypalCreateOrderRes>("/paypal/create-order", {
    method: "POST",
    body: JSON.stringify({ amountUsd }),
  });
}

export async function capturePaypalOrder(
  paypalOrderId: string,
  input: {
    userId: number;
    shippingFee: number;
    shippingAddress: string;
    receiverName: string;
    receiverPhone: string;
    note?: string;
  }
) {
  const res = await apiFetch<any>(`/paypal/capture-order/${paypalOrderId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  return res.data ?? res;
}