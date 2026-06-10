import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AdminField,
  AdminFieldGrid,
  AdminPanel,
} from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockOrderItems, mockOrders } from "@/data/admin-mock";
import { loadOrderItems, loadOrders } from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft } from "lucide-react";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "@/lib/api/orders-api";

const ORDER_STATUS_FLOW = [
  "CONFIRMED",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
];

const ORDER_CANCEL_STATUS = "CANCELLED";

const PAYMENT_STATUS_FLOW = ["PENDING", "PAID", "FAILED", "REFUNDED"];

function canMoveForward(flow: string[], current: string, next: string) {
  return flow.indexOf(next) > flow.indexOf(current);
}

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);

  const [order, setOrder] = useState(() =>
    mockOrders.find((o) => o.order_id === orderId)
  );
  const [items, setItems] = useState(mockOrderItems[orderId] ?? []);

  useEffect(() => {
    void loadOrders().then((list) =>
      setOrder(list.find((o) => o.order_id === orderId))
    );
    void loadOrderItems(orderId).then(setItems);
  }, [orderId]);

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Order not found.</p>
        <Link
          to="/admin/orders"
          className="text-[#f6931d] text-sm mt-4 inline-block"
        >
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
      >
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <AdminPageHeader
        title={`Order #${order.order_id}`}
        description={`Placed ${order.created_at}`}
        badge="Admin"
      />

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
            <AdminField
              label="Subtotal"
              value={`${order.subtotal_amount.toLocaleString()} ₫`}
            />
            <AdminField
              label="Shipping"
              value={`${order.shipping_fee.toLocaleString()} ₫`}
            />
            <AdminField
              label="Total"
              value={`${order.total_amount.toLocaleString()} ₫`}
            />
            <AdminField
              label="Payment method"
              value={formatEnum(order.payment_method)}
            />

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Order status
              </p>
              <select
                value={order.order_status}
                className={adminInputClass()}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const currentStatus = order.order_status;

                  if (
                    currentStatus === "DELIVERED" ||
                    currentStatus === "CANCELLED"
                  ) {
                    alert("This order status can no longer be changed.");
                    return;
                  }

                  if (
                    newStatus !== ORDER_CANCEL_STATUS &&
                    !canMoveForward(
                      ORDER_STATUS_FLOW,
                      currentStatus,
                      newStatus
                    )
                  ) {
                    alert("It is not possible to reverse the order status.");
                    return;
                  }

                  const ok = window.confirm(
                    `Are you sure you want to change the order status from ${formatEnum(
                      currentStatus
                    )} to ${formatEnum(
                      newStatus
                    )}? Once changed, it cannot be reversed.`
                  );

                  if (!ok) return;

                  try {
                    await updateOrderStatus(order.order_id, newStatus);

                    setOrder({
                      ...order,
                      order_status: newStatus,
                    });
                  } catch (err) {
                    console.error(err);

                    const latestOrders = await loadOrders();
                    const latestOrder = latestOrders.find(
                      (o) => o.order_id === order.order_id
                    );

                    if (latestOrder?.order_status === newStatus) {
                      setOrder(latestOrder);
                      return;
                    }

                    alert("Update order status failed");
                  }
                }}
              >
                {[...ORDER_STATUS_FLOW, ORDER_CANCEL_STATUS].map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={
                      order.order_status === "DELIVERED" ||
                      order.order_status === "CANCELLED" ||
                      (s !== order.order_status &&
                        s !== ORDER_CANCEL_STATUS &&
                        !canMoveForward(
                          ORDER_STATUS_FLOW,
                          order.order_status,
                          s
                        ))
                    }
                  >
                    {formatEnum(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Payment status
              </p>
              <select
                value={order.payment_status}
                className={adminInputClass()}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const currentStatus = order.payment_status;

                  if (!canMoveForward(PAYMENT_STATUS_FLOW, currentStatus, newStatus)) {
                    alert("It is not possible to reverse the payment status.");
                    return;
                  }

                  const ok = window.confirm(
                    `Are you sure you want to change the payment status from ${formatEnum(
                      currentStatus
                    )} to ${formatEnum(
                      newStatus
                    )}? Once changed, it cannot be reversed.`
                  );

                  if (!ok) return;

                  try {
                    await updatePaymentStatus(order.order_id, newStatus);

                    setOrder({
                      ...order,
                      payment_status: newStatus,
                    });
                  } catch (err) {
                    console.error(err);

                    const latestOrders = await loadOrders();
                    const latestOrder = latestOrders.find(
                      (o) => o.order_id === order.order_id
                    );

                    if (latestOrder?.payment_status === newStatus) {
                      setOrder(latestOrder);
                      return;
                    }

                    alert("Update payment status failed");
                  }
                }}
              >
                {PAYMENT_STATUS_FLOW.map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={
                      s !== order.payment_status &&
                      !canMoveForward(
                        PAYMENT_STATUS_FLOW,
                        order.payment_status,
                        s
                      )
                    }
                  >
                    {formatEnum(s)}
                  </option>
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
                  <tr
                    key={i}
                    className="border-b border-slate-800/80 text-slate-200"
                  >
                    <td className="py-2">{item.product_name_snapshot}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">
                      {item.price_at_purchase.toLocaleString()} ₫
                    </td>
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