import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { SHIPPING_FEE } from "@/lib/public-commerce";
import { useCart } from "@/hooks/useCart";
import { formatVnd } from "@/lib/formatVnd";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react"; 
import { removeCartItem, updateCartItemQuantity } from "@/lib/api/cart-api";

export function CartPage() {
  const { user, refresh } = usePublicAuth();
  const { lines, subtotal, loading, error, reload } = useCart(user?.userId);

  if (!user) return null;

  const onCartChange = () => {
    void reload().then(() => refresh());
  };

  const hasOutOfStockItem = lines.some((line) => (line.stock_quantity ?? 0) <= 0 || line.quantity > (line.stock_quantity ?? 0));

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
            <div className="soft-card p-12 text-center soft-subtext">
              Loading cart…
            </div>
          ) : error ? (
            <div className="soft-card p-12 text-center text-red-500">
              {error}
            </div>
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
                {lines.map((line) => {
                  const isOutOfStock = (line.stock_quantity ?? 0) <= 0;
                  const isNotEnoughStock = line.quantity > (line.stock_quantity ?? 0);

                  return (
                    <div 
                      key={line.cart_id} 
                      className={`public-cart-row relative ${isOutOfStock ? "bg-red-50/50" : ""}`} 
                    >
                      <div className="w-20 h-20 rounded-xl bg-white border flex items-center justify-center shrink-0 relative overflow-hidden">
                        {line.image_url ? (
                          <img 
                            src={line.image_url} 
                            alt={line.product_name} 
                            className={`w-full h-full object-cover ${isOutOfStock ? "blur-[1px] grayscale" : ""}`} 
                          />
                        ) : (
                          <span className="text-2xl">🛒</span> 
                        )}
                        
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white text-center uppercase p-1">
                            Out of stock
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/shop/${line.product_id}`}
                          className={`font-semibold ${isOutOfStock ? "text-gray-400 line-through" : "text-[#2c5f51] hover:text-[#f6931d]"}`}
                        >
                          {line.product_name}
                        </Link>

                        <p className="text-sm soft-subtext mt-1">
                          {formatVnd(line.price)} each
                        </p>

                        {isOutOfStock ? (
                          <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1 bg-red-100/80 px-2 py-1 rounded w-fit">
                            <AlertCircle size={14} /> This product is out of stock. Please remove it to proceed with checkout!
                          </p>
                        ) : isNotEnoughStock ? (
                          <p className="text-xs text-orange-500 font-bold mt-2 flex items-center gap-1 bg-orange-100/80 px-2 py-1 rounded w-fit">
                            <AlertCircle size={14} /> Inventory only has {line.stock_quantity} items left. Please reduce the purchase quantity!
                          </p>
                        ) : null}

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-50"
                            disabled={line.quantity <= 1 || isOutOfStock}
                            onClick={() => {
                              if (line.quantity <= 1) return;
                              void updateCartItemQuantity(line.cart_id, line.quantity - 1).then(onCartChange);
                            }}
                          >
                            <Minus size={14} />
                          </button>

                          <span className={`w-8 text-center text-sm font-medium ${isOutOfStock ? "text-gray-400" : ""}`}>
                            {line.quantity}
                          </span>

                          <button
                            type="button"
                            className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-50"
                            disabled={line.quantity >= (line.stock_quantity ?? 0) || isOutOfStock}
                            onClick={() => {
                              void updateCartItemQuantity(line.cart_id, line.quantity + 1).then(onCartChange);
                            }}
                          >
                            <Plus size={14} />
                          </button>
                          
                          <button
                            type="button"
                            className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200"
                            onClick={() => {
                              void removeCartItem(line.cart_id).then(onCartChange);
                            }}
                            aria-label="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <p className={`shrink-0 font-semibold sm:ml-auto sm:text-right ${isOutOfStock ? "text-gray-400 line-through" : "text-[#3d6b5c]"}`}>
                        {formatVnd(line.price * line.quantity)}
                      </p>
                    </div>
                  );
                })}
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

                {hasOutOfStockItem ? (
                  <Button
                    disabled
                    className="w-full mt-4 rounded-full bg-gray-300 text-gray-500 h-12 font-bold cursor-not-allowed"
                  >
                    Please resolve out-of-stock items before checking out
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full mt-4 rounded-full bg-[#f6931d] hover:bg-orange-600 h-12 font-bold"
                  >
                    <Link to="/checkout">Proceed to checkout</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}