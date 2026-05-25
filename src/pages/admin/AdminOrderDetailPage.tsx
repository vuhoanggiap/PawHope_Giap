import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockOrderItems, mockOrders } from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft } from "lucide-react";

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const initial = mockOrders.find((o) => o.order_id === orderId);
  const [order, setOrder] = useState(initial);
  const items = mockOrderItems[orderId] ?? [];

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Order not found.</p>
        <Link to="/admin/orders" className="text-[#f6931d] text-sm mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <AdminPageHeader title={`Order #${order.order_id}`} description={`Placed ${order.created_at}`} badge="Admin" />

      <div className="flex flex-wrap gap-2 mb-6">
        <StatusBadge value={order.payment_status} />
        <StatusBadge value={order.order_status} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminPanel title="Customer & shipping">
          <AdminFieldGrid>
            <AdminField label="Customer" value={order.customer_name} />
            <AdminField label="Email" value={order.customer_email} />
            <AdminField label="Receiver" value={order.receiver_name} />
            <AdminField label="Phone" value={order.receiver_phone} />
            <AdminField label="Address" value={order.shipping_address} />
            <AdminField label="Note" value={order.note || "—"} />
          </AdminFieldGrid>
        </AdminPanel>

        <AdminPanel title="Payment & fulfillment">
          <AdminFieldGrid>
            <AdminField label="Subtotal" value={`${order.subtotal_amount.toLocaleString()} ₫`} />
            <AdminField label="Shipping" value={`${order.shipping_fee.toLocaleString()} ₫`} />
            <AdminField label="Total" value={`${order.total_amount.toLocaleString()} ₫`} />
            <AdminField label="Payment method" value={formatEnum(order.payment_method)} />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Order status</p>
              <select
                value={order.order_status}
                onChange={(e) => setOrder({ ...order, order_status: e.target.value })}
                className={adminInputClass()}
              >
                {["CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>{formatEnum(s)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Payment status</p>
              <select
                value={order.payment_status}
                onChange={(e) => setOrder({ ...order, payment_status: e.target.value })}
                className={adminInputClass()}
              >
                {["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => (
                  <option key={s} value={s}>{formatEnum(s)}</option>
                ))}
              </select>
            </div>
          </AdminFieldGrid>
        </AdminPanel>
      </div>

      <div className="mt-6">
        <AdminPanel title="Line items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-slate-800/80 text-slate-200">
                  <td className="py-2">{item.product_name_snapshot}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{item.price_at_purchase.toLocaleString()} ₫</td>
                  <td className="text-right py-2">
                    {(item.quantity * item.price_at_purchase).toLocaleString()} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </AdminPanel>
      </div>
    </div>
  );
}
