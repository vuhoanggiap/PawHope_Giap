import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { addToCart, getProduct } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";

export function ShopProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = usePublicAuth();
  const product = getProduct(Number(id));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="public-container py-16 text-center sm:py-24">
        <h1 className="text-2xl font-bold text-[#2c5f51]">Product not found</h1>
        <Button asChild className="mt-6 bg-[#f6931d]">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const handleAdd = () => {
    if (!user) {
      navigate("/login", { state: { from: `/shop/${product.product_id}` } });
      return;
    }
    if (addToCart(user.userId, product.product_id, qty)) {
      refresh();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <>
      <PageHero title={product.product_name} subtitle="Fundraising merchandise" imageUrl={product.image_url} />

      <section className="public-section bg-white">
        <div className="public-container">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#f6931d] mb-8 hover:underline"
          >
            <ArrowLeft size={16} /> Back to shop
          </Link>

          <div className="public-split-grid items-start">
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full rounded-3xl shadow-xl object-cover max-h-[480px]"
            />
            <div className="space-y-6">
              <p className="text-2xl font-bold text-[#2c5f51] sm:text-3xl">{formatVnd(product.price)}</p>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              <p className="text-sm text-gray-500">{product.stock_quantity} in stock</p>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="h-10 rounded-xl border px-3 text-sm"
                >
                  {Array.from({ length: Math.min(5, product.stock_quantity) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleAdd}
                className="w-full sm:w-auto rounded-full bg-[#f6931d] hover:bg-orange-600 font-bold h-12 px-8"
              >
                {added ? (
                  <>
                    <Check size={18} className="mr-2" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} className="mr-2" /> Add to cart
                  </>
                )}
              </Button>

              {!user ? (
                <p className="text-xs text-gray-400">Sign in required to add items to your cart.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
