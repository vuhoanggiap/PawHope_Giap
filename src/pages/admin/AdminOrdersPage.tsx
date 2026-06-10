import { Link } from "react-router-dom";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockOrders } from "@/data/admin-mock";
import { loadOrders } from "@/lib/admin/admin-data";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await loadOrders();

        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        if (!cancelled) {
          setOrders(sorted);
        }
      } catch (err) {
        console.error("Load orders failed", err);
      }
    };

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Shop orders"
        description="Open an order for shipping and payment details."
        badge="Admin"
      />

      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.order_id}
            to={`/admin/orders/${o.order_id}`}
            className="admin-card-hover group flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium text-white group-hover:text-[#f6931d]">
                Order #{o.order_id}
              </p>
              <p className="text-sm text-slate-400">
                {o.customer_name} · {o.created_at}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-white">
                {o.total_amount.toLocaleString()} ₫
              </span>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/[0.06]">
                {o.order_status}
              </span>
              <ChevronRight size={18} className="text-slate-600" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AdminDataTable
          rows={orders.map((o) => ({
            id: o.order_id,
            customer: o.customer_name,
            payment: o.payment_status,
            order: o.order_status,
            total: o.total_amount.toLocaleString() + " ₫",
          }))}
          columns={[
            { key: "id", label: "ID" },
            { key: "customer", label: "Customer" },
            { key: "payment", label: "Payment" },
            { key: "order", label: "Order status" },
            { key: "total", label: "Total" },
          ]}
        />
      </div>
    </div>
  );
}