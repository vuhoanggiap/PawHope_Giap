import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  checkout,
  getCartDetails,
  getCartSubtotal,
  loadUserCart,
  SHIPPING_FEE,
} from "@/lib/public-commerce";
import { USE_MOCK } from "@/lib/api-client";
import { formatVnd } from "@/lib/formatVnd";
import { CheckCircle2 } from "lucide-react";

export function CheckoutPage() {
  const { user, refresh } = usePublicAuth();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [ready, setReady] = useState(USE_MOCK);

  useEffect(() => {
    if (!user || USE_MOCK) return;
    void loadUserCart(user.userId).then(() => setReady(true));
  }, [user]);

  if (!user) return null;

  const lines = getCartDetails(user.userId);
  const subtotal = getCartSubtotal(user.userId);

  if (!ready && !USE_MOCK) {
    return (
      <div className="public-container py-16 text-center">
        <p className="soft-subtext">Loading checkout…</p>
      </div>
    );
  }

  if (lines.length === 0 && !orderId) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const order = await checkout(user.userId, {
      receiver_name: String(fd.get("name") || ""),
      receiver_phone: String(fd.get("phone") || ""),
      shipping_address: String(fd.get("address") || ""),
      note: String(fd.get("note") || "") || undefined,
    });
    if (order) {
      refresh();
      setOrderId(order.order_id);
    }
  };

  const fieldClass = "mt-1 rounded-xl border-[#2c5f51]/10";

  return (
    <>
      <PageHero
        title="Checkout"
        subtitle="PayPal preview — payment marked as paid in demo."
        imageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600"
      />

      <section className="public-section soft-section-cream min-h-[50vh]">
        <div className="public-container max-w-4xl">
          {orderId ? (
            <div className="soft-card p-10 text-center space-y-4">
              <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
              <h2 className="text-xl font-bold text-[#2c5f51]">Order placed!</h2>
              <p className="soft-subtext">Order #{orderId} · Payment preview: PAID via PayPal</p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to={`/account/orders/${orderId}`}>View order</Link>
                </Button>
                <Button asChild className="rounded-full bg-[#2c5f51]">
                  <Link to="/shop">Continue shopping</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="public-split-grid lg:grid-cols-5">
              <form onSubmit={handleSubmit} className="lg:col-span-3 soft-card p-6 md:p-8 space-y-4">
                <h2 className="font-semibold text-[#2c5f51]">Shipping details</h2>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Full name</label>
                  <Input name="name" required defaultValue={user.fullName} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Phone</label>
                  <Input name="phone" required defaultValue={user.phone} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Shipping address</label>
                  <Textarea name="address" required placeholder="Street, district, city" className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Order note (optional)</label>
                  <Input name="note" placeholder="Delivery instructions..." className={fieldClass} />
                </div>
                <Button type="submit" className="w-full rounded-full bg-[#f6931d] hover:bg-orange-600 h-12 font-bold">
                  Place order (PayPal preview)
                </Button>
              </form>

              <div className="lg:col-span-2 soft-card p-6 h-fit space-y-4">
                <h3 className="font-semibold text-[#2c5f51]">Order summary</h3>
                <ul className="space-y-2 text-sm soft-subtext">
                  {lines.map((l) => (
                    <li key={l.product_id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {l.product.product_name} × {l.quantity}
                      </span>
                      <span className="shrink-0">{formatVnd(l.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between soft-subtext">
                    <span>Subtotal</span>
                    <span>{formatVnd(subtotal)}</span>
                  </div>
                  <div className="flex justify-between soft-subtext">
                    <span>Shipping</span>
                    <span>{formatVnd(SHIPPING_FEE)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#2c5f51] pt-2">
                    <span>Total</span>
                    <span>{formatVnd(subtotal + SHIPPING_FEE)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
