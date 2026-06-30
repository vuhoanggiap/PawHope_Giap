import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { formatPublicEnum } from "@/data/public-mock";
import type { PublicOrder } from "@/data/public-mock";
import { loadUserOrders } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { ChevronRight, ChevronLeft } from "lucide-react"; 

export function AccountOrdersPage() {
  const { user } = usePublicAuth();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user) return;

    void loadUserOrders(user.userId).then((data) => {
      setOrders(
        [...data].sort((a, b) => b.order_id - a.order_id)
      );
    });
  }, [user]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentOrders = useMemo(() => {
    return orders.slice(indexOfFirstItem, indexOfLastItem);
  }, [orders, indexOfFirstItem, indexOfLastItem]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (!user) return null;

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
        <>
          <div className="space-y-3">
            {currentOrders.map((o) => (
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

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-xs soft-subtext">
                Showing <span className="font-medium text-[#2c5f51]">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium text-[#2c5f51]">
                  {Math.min(indexOfLastItem, orders.length)}
                </span>{" "}
                of <span className="font-medium text-[#2c5f51]">{orders.length}</span> orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2c5f51]/[0.06] text-gray-400 hover:bg-[#e6f2ec] hover:text-[#2c5f51] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-xs text-gray-500 font-medium px-2">
                  Page {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2c5f51]/[0.06] text-gray-400 hover:bg-[#e6f2ec] hover:text-[#2c5f51] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}