import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button"; 
import { getCartDetails, getCartSubtotal, loadUserCart, SHIPPING_FEE } from "@/lib/public-commerce";
import { USE_MOCK } from "@/lib/api-client";
import { formatVnd } from "@/lib/formatVnd";
import { createPaypalOrder, capturePaypalOrder } from "@/lib/api/paypal-api";
import { apiFetch } from "@/lib/api-client"; 
import { Clock, AlertCircle } from "lucide-react";
import { checkoutFromCart } from "@/lib/api/orders-api";

export function CheckoutPage() {
  const { user, refresh } = usePublicAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(USE_MOCK);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [dbOrder, setDbOrder] = useState<any>(null); 
  const [timeLeft, setTimeLeft] = useState<number>(240); 
  const [isTimeout, setIsTimeout] = useState(false);
  const [isLockingStock, setIsLockingStock] = useState(false);

  useEffect(() => {
    if (!user || USE_MOCK) return;

    setReceiverName(user.fullName || "");
    setReceiverPhone(user.phone || "");

    void loadUserCart(user.userId).then(() => setReady(true));
  }, [user]);

  useEffect(() => {
    if (!dbOrder) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeout(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dbOrder]);

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

  if (lines.length === 0 && !dbOrder) {
    return <Navigate to="/cart" replace />;
  }

const handleLockStockAndProceed = async () => {
    if (!receiverName || !receiverPhone || !shippingAddress) return;
    setIsLockingStock(true);
    try {
      const result = await checkoutFromCart({
        userId: user.userId,
        shippingAddress,
        receiverName,
        receiverPhone,
        note: note || undefined,
        shippingFee: SHIPPING_FEE,
      });

      if (result && result.rawData) {
        setDbOrder(result.rawData); 
        setTimeLeft(240); 
        setIsTimeout(false);
        await refresh();
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create order. Please try again.");
    } finally {
      setIsLockingStock(false);
    }
  };;

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
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
          {dbOrder && (
            <div className="mb-6">
              {isTimeout ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-2 font-semibold text-sm">
                  <AlertCircle size={18} />
                  The payment period has expired. Your order has been cancelled.
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-between font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="animate-pulse text-amber-600" />
                    <span>The system is holding the items in your cart for 4 minutes:</span>
                  </div>
                  <span className="font-mono text-base font-bold bg-white px-3 py-1 rounded-xl border border-amber-300 text-amber-600">
                    {minutes}:{seconds}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="public-split-grid lg:grid-cols-5">
            <div className="lg:col-span-3 soft-card p-6 md:p-8 space-y-4">
              <h2 className="font-semibold text-[#2c5f51]">
                Shipping details
              </h2>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">Full name</label>
                <Input
                  required
                  disabled={!!dbOrder}
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">Phone</label>
                <Input
                  required
                  disabled={!!dbOrder}
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">Shipping address</label>
                <Textarea
                  required
                  disabled={!!dbOrder}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street, district, city"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#5a6b60]">Order note (optional)</label>
                <Input
                  disabled={!!dbOrder}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Delivery instructions..."
                  className={fieldClass}
                />
              </div>

              <div className="pt-3">
                {!dbOrder ? (
                  <Button
                    onClick={handleLockStockAndProceed}
                    disabled={isLockingStock || !receiverName || !receiverPhone || !shippingAddress}
                    className="w-full h-12 rounded-full bg-[#2c5f51] hover:bg-[#1e4238] font-bold text-white text-base"
                  >
                    {isLockingStock ? "Processing..." : "Payment confirmation"}
                  </Button>
                ) : isTimeout ? (
                  <Button
                    disabled
                    className="w-full h-12 rounded-full bg-gray-300 text-gray-500 font-bold cursor-not-allowed"
                  >
                    Order Expired
                  </Button>
                ) : (
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "gold",
                      shape: "pill",
                      label: "paypal",
                    }}
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

                      await apiFetch(`/orders/${dbOrder.orderId}/order-status?status=CONFIRMED`, { method: "PATCH" });
                      await apiFetch(`/orders/${dbOrder.orderId}/payment-status?status=PAID`, { method: "PATCH" });
                      await refresh();
                      navigate("/account/orders");
                    }}
                    onCancel={() => {
                      alert("Payment cancelled. Your stock reservation is still active during the 4-minute period.");
                    }}
                    onError={(err) => {
                      console.error(err);
                      alert("Payment failed");
                    }}
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-2 soft-card p-6 h-fit space-y-4">
              <h3 className="font-semibold text-[#2c5f51]">Order summary</h3>
              <ul className="space-y-2 text-sm soft-subtext">
                {lines.map((l) => (
                  <li key={l.product_id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {l.product?.product_name || "Sản phẩm"} x {l.quantity}
                    </span>
                    <span className="shrink-0">
                      {formatVnd(l.lineTotal || ((l.product?.price || 0) * l.quantity))}
                    </span>
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