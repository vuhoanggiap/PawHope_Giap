import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { getCartDetails } from "@/lib/public-commerce";
import { fetchCartByUser, type ApiCartLine } from "@/lib/api/cart-api";

export function useCart(userId: number | undefined) {
  const [lines, setLines] = useState<ApiCartLine[]>([]);
  const [loading, setLoading] = useState(Boolean(userId && !USE_MOCK));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setLines([]);
      setLoading(false);
      return;
    }

    if (USE_MOCK) {
      const mockLines = getCartDetails(userId).map((line) => ({
        cart_id: line.product_id,
        product_id: line.product_id,
        quantity: line.quantity,
        product_name: line.product.product_name,
        price: line.product.price,
      }));

      setLines(mockLines);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCartByUser(userId);
      setLines(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load cart");
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  }, [lines]);

  return { lines, subtotal, loading, error, reload };
}