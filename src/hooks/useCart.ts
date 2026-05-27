import { useCallback, useEffect, useState } from "react";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { getCartDetails, getCartSubtotal, loadUserCart } from "@/lib/public-commerce";

export function useCart(userId: number | undefined) {
  const [lines, setLines] = useState(() => (userId ? getCartDetails(userId) : []));
  const [loading, setLoading] = useState(Boolean(userId && !USE_MOCK));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setLines([]);
      return;
    }
    if (USE_MOCK) {
      setLines(getCartDetails(userId));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await loadUserCart(userId);
      setLines(getCartDetails(userId));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load cart");
      setLines(getCartDetails(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const subtotal = userId ? getCartSubtotal(userId) : 0;

  return { lines, subtotal, loading, error, reload };
}
