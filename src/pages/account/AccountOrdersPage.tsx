import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { formatPublicEnum } from "@/data/public-mock";
import { getUserOrders } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { ChevronRight } from "lucide-react";

export function AccountOrdersPage() {
  const { user } = usePublicAuth();
  if (!user) return null;

  const orders = getUserOrders(user.userId);

  return (
    <div className="soft-card p-6 md:p-8">
      <h2 className="soft-heading text-lg mb-1">My orders</h2>
      <p className="soft-subtext text-sm mb-6">Shop purchases and delivery status.</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 soft-subtext">
          <p>No orders yet.</p>
          <Link to="/shop" className="inline-block mt-4 text-[#f6931d] font-medium hover:underline">
            Visit shop →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.order_id}
              to={`/account/orders/${o.order_id}`}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#2c5f51]/[0.06] hover:border-[#f6931d]/25 transition-all group"
            >
              <div>
                <p className="font-semibold text-[#2c5f51] group-hover:text-[#f6931d]">
                  Order #{o.order_id}
                </p>
                <p className="text-sm soft-subtext">{o.created_at} · {o.items.length} item(s)</p>
                <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#e6f2ec] text-[#3d6b5c]">
                  {formatPublicEnum(o.order_status)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#3d6b5c]">{formatVnd(o.total_amount)}</span>
                <ChevronRight className="text-gray-300 group-hover:text-[#f6931d]" size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
