import { Link } from "react-router-dom";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockOrders } from "@/data/admin-mock";
import { ChevronRight } from "lucide-react";

export function AdminOrdersPage() {
  return (
    <div>
      <AdminPageHeader title="Shop orders" description="Open an order for shipping and payment details." badge="Admin" />

      <div className="space-y-3">
        {mockOrders.map((o) => (
          <Link
            key={o.order_id}
            to={`/admin/orders/${o.order_id}`}
            className="admin-card-hover group flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium text-white group-hover:text-[#f6931d]">Order #{o.order_id}</p>
              <p className="text-sm text-slate-400">{o.customer_name} · {o.created_at}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white">{o.total_amount.toLocaleString()} ₫</span>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/[0.06]">{o.order_status}</span>
              <ChevronRight size={18} className="text-slate-600" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AdminDataTable
          rows={mockOrders.map((o) => ({
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
