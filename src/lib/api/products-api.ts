import { apiFetch } from "@/lib/api-client";
import { mapProductRes, type ProductResDto } from "@/lib/api/product-mapper";
import type { PublicProduct } from "@/data/public-mock";

export async function fetchActiveProducts(): Promise<PublicProduct[]> {
  const list = await apiFetch<ProductResDto[]>("/products/active");
  return list.map(mapProductRes);
}

export async function fetchProductById(productId: number): Promise<PublicProduct> {
  const dto = await apiFetch<ProductResDto>(`/products/${productId}`);
  return mapProductRes(dto);
}

export async function fetchAllProducts(): Promise<PublicProduct[]> {
  const list = await apiFetch<ProductResDto[]>("/products");
  return list.map(mapProductRes);
}

export async function saveProductApi(product: PublicProduct, isNew: boolean) {
  const body = {
    productName: product.product_name,
    description: product.description,
    price: product.price,
    stockQuantity: product.stock_quantity,
    imageUrl: product.image_url,
    isActive: product.is_active,
  };
  if (isNew) {
    return apiFetch<ProductResDto>("/products", { method: "POST", body: JSON.stringify(body) });
  }
  return apiFetch<ProductResDto>(`/products/${product.product_id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function toggleProductActiveApi(productId: number, isActive: boolean) {
  return apiFetch<ProductResDto>(`/products/${productId}/active?isActive=${isActive}`, {
    method: "PATCH",
  });
}
