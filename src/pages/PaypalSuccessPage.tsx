import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { capturePaypalOrder } from "@/lib/api/paypal-api";

export function PaypalSuccessPage() {
  const [params] = useSearchParams();
  const { refresh } = usePublicAuth();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const paypalOrderId = params.get("token");
    const raw = localStorage.getItem("paypal_checkout_info");

    if (!paypalOrderId || !raw) {
      setError("Missing PayPal checkout info.");
      return;
    }

    const checkoutInfo = JSON.parse(raw);

    capturePaypalOrder(paypalOrderId, checkoutInfo)
      .then((order) => {
        localStorage.removeItem("paypal_checkout_info");
        refresh();
        setOrderId(order.orderId ?? order.order_id);
      })
      .catch((err) => {
        console.error("PAYPAL CAPTURE ERROR:", err);
        setError("Capture PayPal payment failed.");
      });
  }, [params, refresh]);

  if (error) return <div className="public-container py-16">{error}</div>;

  if (!orderId) {
    return <div className="public-container py-16">Completing payment...</div>;
  }

  return (
    <div className="public-container py-16 text-center">
      <h1 className="text-2xl font-bold text-[#2c5f51]">Order placed!</h1>
      <p className="soft-subtext mt-2">Payment completed via PayPal Sandbox.</p>

      <Button asChild className="mt-6 rounded-full bg-[#2c5f51]">
        <Link to={`/account/orders/${orderId}`}>View order</Link>
      </Button>
    </div>
  );
}