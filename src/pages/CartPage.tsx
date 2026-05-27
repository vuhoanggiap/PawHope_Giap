import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { removeFromCart, SHIPPING_FEE, updateCartQuantity } from "@/lib/public-commerce";
import { useCart } from "@/hooks/useCart";
import { formatVnd } from "@/lib/formatVnd";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartPage() {
  const { user, refresh } = usePublicAuth();
  const { lines, subtotal, loading, reload } = useCart(user?.userId);
  if (!user) return null;

  const onCartChange = () => {
    void reload().then(() => refresh());
  };

  return (
    <>
      <PageHero
        title="Your cart"
        subtitle="Review items before checkout."
        imageUrl="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1600"
      />

      <section className="public-section soft-section-warm min-h-[50vh]">
        <div className="public-container-narrow">
          {loading ? (
            <div className="soft-card p-12 text-center soft-subtext">Loading cart…</div>
          ) : lines.length === 0 ? (
            <div className="soft-card p-12 text-center space-y-4">
              <p className="soft-subtext">Your cart is empty.</p>
              <Button asChild className="rounded-full bg-[#2c5f51]">
                <Link to="/shop">Browse shop</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="soft-card divide-y divide-[#2c5f51]/[0.06]">
                {lines.map((line) => (
                  <div key={line.product_id} className="public-cart-row">
                    <img
                      src={line.product.image_url}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/shop/${line.product_id}`}
                        className="font-semibold text-[#2c5f51] hover:text-[#f6931d]"
                      >
                        {line.product.product_name}
                      </Link>
                      <p className="text-sm soft-subtext mt-1">{formatVnd(line.product.price)} each</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border hover:bg-white"
                          onClick={() => {
                            void updateCartQuantity(user.userId, line.product_id, line.quantity - 1).then(
                              onCartChange
                            );
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border hover:bg-white"
                          onClick={() => {
                            void updateCartQuantity(user.userId, line.product_id, line.quantity + 1).then(
                              onCartChange
                            );
                          }}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => {
                            void removeFromCart(user.userId, line.product_id).then(onCartChange);
                          }}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 font-semibold text-[#3d6b5c] sm:ml-auto sm:text-right">
                      {formatVnd(line.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="soft-card p-6 space-y-3 text-sm">
                <div className="flex justify-between soft-subtext">
                  <span>Subtotal</span>
                  <span>{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between soft-subtext">
                  <span>Shipping</span>
                  <span>{formatVnd(SHIPPING_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#2c5f51] text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatVnd(subtotal + SHIPPING_FEE)}</span>
                </div>
                <Button asChild className="w-full mt-4 rounded-full bg-[#f6931d] hover:bg-orange-600 h-12 font-bold">
                  <Link to="/checkout">Proceed to checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
