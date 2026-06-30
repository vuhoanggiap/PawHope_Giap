import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { AddToCartToast } from "@/components/public/AddToCartToast";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { useProductDetail } from "@/hooks/useProductCatalog";
import { addCartItem } from "@/lib/api/cart-api";
import { formatVnd } from "@/lib/formatVnd";
import { ArrowLeft, Check, ShoppingCart, CreditCard } from "lucide-react"; 

export function ShopProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = usePublicAuth();

  const productId = Number(id);
  const { product, loading, error } = useProductDetail(productId);

  const [qty, setQty] = useState(1);
  const [localStock, setLocalStock] = useState(0);
  const [added, setAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false); 
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error";
  }>({
    open: false,
    variant: "success",
  });

  useEffect(() => {
    if (product) {
      setLocalStock(product.stock_quantity);
    }
  }, [product]);

  const closeToast = useCallback(() => {
    setToast((current) => ({ ...current, open: false }));
  }, []);

  const handleCartAction = async (actionType: "add" | "buy_now") => {
    if (!product) return;

    if (!user) {
      navigate("/login", { state: { from: `/shop/${product.product_id}` } });
      return;
    }

    if (localStock <= 0) return;

    try {
      if (actionType === "buy_now") setIsBuyingNow(true);

      await addCartItem(user.userId, product.product_id, qty);

      setQty(1);
      refresh(); 

      if (actionType === "buy_now") {
        navigate("/cart"); 
      } else {
        setAdded(true);
        setToast({ open: true, variant: "success" });
        window.setTimeout(() => setAdded(false), 2000);
      }
    } catch (e) {
      console.error(e);
      setToast({ open: true, variant: "error" });
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (loading) {
    return (
      <div className="public-container py-16 text-center sm:py-24">
        <p className="soft-subtext">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="public-container py-16 text-center sm:py-24">
        <h1 className="text-2xl font-bold text-[#2c5f51]">Product not found</h1>
        {error ? <p className="mt-2 text-sm soft-subtext">{error}</p> : null}
        <Button asChild className="mt-6 bg-[#f6931d]">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHero
        title={product.product_name}
        subtitle="Fundraising merchandise"
        imageUrl={product.image_url}
      />

      <section className="public-section bg-white">
        <div className="public-container">
          <Link
            to="/shop"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#f6931d] hover:underline"
          >
            <ArrowLeft size={16} /> Back to shop
          </Link>

          <div className="public-split-grid items-start">
            <img
              src={product.image_url}
              alt={product.product_name}
              className="max-h-[480px] w-full rounded-3xl object-cover shadow-xl"
            />

            <div className="space-y-6">
              <p className="text-2xl font-bold text-[#2c5f51] sm:text-3xl">
                {formatVnd(product.price)}
              </p>

              <p className="leading-relaxed text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-500">{localStock} in stock</p>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  disabled={localStock <= 0}
                  className="h-10 rounded-xl border px-3 text-sm"
                >
                  {Array.from({ length: Math.min(5, localStock) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => handleCartAction("add")}
                  disabled={localStock <= 0 || isBuyingNow}
                  variant="outline"
                  className="h-12 flex-1 rounded-full border-[#f6931d] text-[#f6931d] font-bold hover:bg-orange-50"
                >
                  {localStock <= 0 ? (
                    <>Out of stock</>
                  ) : added ? (
                    <>
                      <Check size={18} className="mr-2" /> Added to cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} className="mr-2" /> Add to cart
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleCartAction("buy_now")}
                  disabled={localStock <= 0 || isBuyingNow}
                  className="h-12 flex-1 rounded-full bg-[#f6931d] font-bold hover:bg-orange-600"
                >
                  {localStock <= 0 ? (
                    <>Out of stock</>
                  ) : isBuyingNow ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CreditCard size={18} className="mr-2" /> Buy now
                    </>
                  )}
                </Button>
              </div>

              {!user ? (
                <p className="text-xs text-gray-400">
                  Sign in required to buy or add items to your cart.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <AddToCartToast
        open={toast.open}
        variant={toast.variant}
        productName={product.product_name}
        quantity={qty}
        onClose={closeToast}
      />
    </>
  );
}