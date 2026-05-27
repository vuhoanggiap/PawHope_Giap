import { useCallback, useEffect, useState } from "react";
import type { PublicProduct } from "@/data/public-mock";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import {
  getProduct,
  getProducts,
  loadProductCatalog,
  loadProductById,
} from "@/lib/public-commerce";

export function useProductCatalog() {
  const [products, setProducts] = useState<PublicProduct[]>(() =>
    USE_MOCK ? getProducts() : []
  );
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (USE_MOCK) {
      setProducts(getProducts());
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await loadProductCatalog();
      setProducts(list);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to load products";
      setError(message);
      setProducts(getProducts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { products, loading, error, reload };
}

export function useProductDetail(productId: number) {
  const [product, setProduct] = useState<PublicProduct | undefined>(() =>
    USE_MOCK ? getProduct(productId) : undefined
  );
  const [loading, setLoading] = useState(!USE_MOCK && productId > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || Number.isNaN(productId)) {
      setProduct(undefined);
      setLoading(false);
      return;
    }
    if (USE_MOCK) {
      setProduct(getProduct(productId));
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadProductById(productId)
      .then((p) => {
        if (!cancelled) setProduct(p);
      })
      .catch((e) => {
        if (cancelled) return;
        const message =
          e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to load product";
        setError(message);
        setProduct(undefined);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, loading, error };
}
