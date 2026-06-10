import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";

import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getCartDetails,
  getCartSubtotal,
  loadUserCart,
  SHIPPING_FEE,
} from "@/lib/public-commerce";
import { USE_MOCK } from "@/lib/api-client";
import { formatVnd } from "@/lib/formatVnd";
import { createPaypalOrder, capturePaypalOrder } from "@/lib/api/paypal-api";

export function CheckoutPage() {
  const { user, refresh } = usePublicAuth();
  const navigate = useNavigate();

  const [ready, setReady] = useState(USE_MOCK);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user || USE_MOCK) return;

    setReceiverName(user.fullName || "");
    setReceiverPhone(user.phone || "");

    void loadUserCart(user.userId).then(() => setReady(true));
  }, [user]);

  if (!user) return null;

  const lines = getCartDetails(user.userId);
  const subtotal = getCartSubtotal(user.userId);
  const total = subtotal + SHIPPING_FEE;

  if (!ready && !USE_MOCK) {
    return (
      <div className="public-container py-16 text-center">
        <p className="soft-subtext">Loading checkout…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const fieldClass = "mt-1 rounded-xl border-[#2c5f51]/10";

  return (
    <>
      <PageHero
        title="Checkout"
        subtitle="Pay securely with PayPal Sandbox."
        imageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600"
      />

      <section className="public-section soft-section-cream min-h-[50vh]">
        <div className="public-container max-w-4xl">
          <div className="public-split-grid lg:grid-cols-5">
            <div className="lg:col-span-3 soft-card p-6 md:p-8 space-y-4">
              <h2 className="font-semibold text-[#2c5f51]">
                Shipping details
              </h2>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">
                  Full name
                </label>
                <Input
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">
                  Phone
                </label>
                <Input
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">
                  Shipping address
                </label>
                <Textarea
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street, district, city"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">
                  Order note (optional)
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Delivery instructions..."
                  className={fieldClass}
                />
              </div>

              <div className="pt-3">
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "pill",
                    label: "paypal",
                  }}
                  disabled={!receiverName || !receiverPhone || !shippingAddress}
                  createOrder={async () => {
                    const amountUsd = Number((total / 25000).toFixed(2));
                    const paypalOrder = await createPaypalOrder(amountUsd);

                    return paypalOrder.id;
                  }}
                  onApprove={async (data) => {
                    if (!data.orderID) return;

                    await capturePaypalOrder(data.orderID, {
                      userId: user.userId,
                      shippingFee: SHIPPING_FEE,
                      shippingAddress,
                      receiverName,
                      receiverPhone,
                      note: note || undefined,
                    });

                    await refresh();

                    navigate("/account/orders");
                  }}
                  onCancel={() => {
                    alert("Payment cancelled");
                  }}
                  onError={(err) => {
                    console.error(err);
                    alert("Payment failed");
                  }}
                />
              </div>
            </div>

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
                  <span>{formatVnd(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}