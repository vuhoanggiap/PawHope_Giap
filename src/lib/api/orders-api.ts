import { apiFetch } from "@/lib/api-client";
import { mapOrderRes } from "@/lib/api/mappers";
import type { PublicOrder } from "@/data/public-mock";

export type CheckoutBody = {
  userId: number;
  shippingFee: number;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  note?: string;
};

export async function checkoutFromCart(body: CheckoutBody): Promise<{ order: PublicOrder; rawData: any }> {
  const response = await apiFetch<any>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const dto = response.data || response; 

  return {
    order: mapOrderRes(dto),
    rawData: dto 
  };
}

export async function fetchOrdersByUser(userId: number): Promise<PublicOrder[]> {
  const response = await apiFetch<any>(`/orders/user/${userId}`);
  const list = response.data || response;
  return list.map(mapOrderRes);
}

export async function fetchOrderById(orderId: number): Promise<PublicOrder> {
  const response = await apiFetch<any>(`/orders/${orderId}`);
  const dto = response.data || response;
  return mapOrderRes(dto);
}

export async function fetchAllOrders(): Promise<PublicOrder[]> {
  const response = await apiFetch<any>("/orders");
  const list = response.data || response;
  return list.map(mapOrderRes);
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<PublicOrder> {
  const response = await apiFetch<any>(
    `/orders/${orderId}/order-status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    }
  );
  const dto = response.data || response;
  return mapOrderRes(dto);
}

export async function updatePaymentStatus(
  orderId: number,
  status: string
): Promise<PublicOrder> {
  const response = await apiFetch<any>(
    `/orders/${orderId}/payment-status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    }
  );
  const dto = response.data || response;
  return mapOrderRes(dto);
}