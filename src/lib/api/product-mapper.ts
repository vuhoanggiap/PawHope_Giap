import type { PublicProduct } from "@/data/public-mock";

/** Shape returned by Spring Boot ProductRes (Jackson camelCase). */
export type ProductResDto = {
  productId: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  isActive: boolean;
};

export function mapProductRes(dto: ProductResDto): PublicProduct {
  return {
    product_id: dto.productId,
    product_name: dto.productName,
    description: dto.description ?? "",
    price: Number(dto.price),
    stock_quantity: dto.stockQuantity ?? 0,
    image_url: dto.imageUrl ?? "",
    is_active: dto.isActive ?? true,
  };
}
