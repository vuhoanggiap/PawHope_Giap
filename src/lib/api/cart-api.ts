import { apiFetch } from "@/lib/api-client";
import type { CartResDto } from "@/lib/api/mappers";
import { toNumber } from "@/lib/api/format";

export type ApiCartLine = {
  cart_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
};

export function mapCartLine(dto: CartResDto): ApiCartLine {
  return {
    cart_id: dto.cartId,
    product_id: dto.productId,
    quantity: dto.quantity,
    product_name: dto.productName,
    price: toNumber(dto.price),
  };
}

export async function fetchCartByUser(userId: number): Promise<ApiCartLine[]> {
  const list = await apiFetch<CartResDto[]>(`/cart/user/${userId}`);
  return list.map(mapCartLine);
}

export async function addCartItem(userId: number, productId: number, quantity: number) {
  return apiFetch<CartResDto>("/cart", {
    method: "POST",
    body: JSON.stringify({ userId, productId, quantity }),
  });
}

export async function updateCartItemQuantity(cartId: number, quantity: number) {
  return apiFetch<CartResDto>(`/cart/${cartId}/quantity?quantity=${quantity}`, {
    method: "PATCH",
  });
}

export async function removeCartItem(cartId: number) {
  await apiFetch<string>(`/cart/${cartId}`, { method: "DELETE" });
}

export async function clearUserCart(userId: number) {
  await apiFetch<string>(`/cart/user/${userId}`, { method: "DELETE" });
}
