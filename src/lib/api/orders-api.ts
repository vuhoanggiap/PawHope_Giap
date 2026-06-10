import { apiFetch } from "@/lib/api-client";
import { mapOrderRes, type OrderResDto } from "@/lib/api/mappers";
import type { PublicOrder } from "@/data/public-mock";

export type CheckoutBody = {
  userId: number;
  shippingFee: number;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  note?: string;
};

export async function checkoutFromCart(body: CheckoutBody): Promise<PublicOrder> {
  const dto = await apiFetch<OrderResDto>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapOrderRes(dto);
}

export async function fetchOrdersByUser(userId: number): Promise<PublicOrder[]> {
  const list = await apiFetch<OrderResDto[]>(`/orders/user/${userId}`);
  return list.map(mapOrderRes);
}

export async function fetchOrderById(orderId: number): Promise<PublicOrder> {
  const dto = await apiFetch<OrderResDto>(`/orders/${orderId}`);
  return mapOrderRes(dto);
}

export async function fetchAllOrders(): Promise<PublicOrder[]> {
  const list = await apiFetch<OrderResDto[]>("/orders");
  return list.map(mapOrderRes);
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<PublicOrder> {
  const dto = await apiFetch<OrderResDto>(
    `/orders/${orderId}/order-status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    }
  );

  return mapOrderRes(dto);
}

export async function updatePaymentStatus(
  orderId: number,
  status: string
): Promise<PublicOrder> {
  const dto = await apiFetch<OrderResDto>(
    `/orders/${orderId}/payment-status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    }
  );

  return mapOrderRes(dto);
}