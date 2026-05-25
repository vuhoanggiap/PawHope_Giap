import { Link, useParams } from "react-router-dom";
import { StatusTimeline } from "@/components/public/StatusTimeline";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { formatPublicEnum, orderProgressSteps, orderStatusIndex } from "@/data/public-mock";
import { getOrderById } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { ArrowLeft } from "lucide-react";

export function AccountOrderDetailPage() {
  const { id } = useParams();
  const { user } = usePublicAuth();
  if (!user) return null;

  const order = getOrderById(user.userId, Number(id));

  if (!order) {
    return (
      <div className="soft-card p-8 text-center soft-subtext">
        <p>Order not found.</p>
        <Link to="/account/orders" className="text-[#f6931d] font-medium mt-4 inline-block hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const activeIndex = orderStatusIndex(order.order_status);

  return (
    <div className="space-y-6">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#f6931d] hover:underline"
      >
        <ArrowLeft size={16} /> All orders
      </Link>

      <div className="soft-card p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="soft-label">Order</p>
            <h2 className="text-2xl font-bold text-[#2c5f51]">#{order.order_id}</h2>
            <p className="text-sm soft-subtext mt-1">{order.created_at}</p>
          </div>
          <div className="text-right text-sm space-y-1">
            <p>
              Payment:{" "}
              <span className="font-semibold text-[#3d6b5c]">{formatPublicEnum(order.payment_status)}</span>
            </p>
            <p className="font-bold text-[#2c5f51]">{formatVnd(order.total_amount)}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[#2c5f51] mb-3">Items</h3>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between soft-subtext">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatVnd(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#a8b8ae]">Ship to</p>
            <p className="mt-1 text-[#3d6b5c]">{order.receiver_name}</p>
            <p className="soft-subtext">{order.receiver_phone}</p>
            <p className="soft-subtext mt-1">{order.shipping_address}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[#2c5f51] mb-4">Delivery progress</h3>
          <StatusTimeline
            steps={orderProgressSteps.map((s) => ({
              id: s.status,
              label: s.label,
              description: s.description,
            }))}
            activeIndex={Math.max(activeIndex, 0)}
          />
        </div>
      </div>
    </div>
  );
}
